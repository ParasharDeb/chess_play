import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { randomUUID } from "crypto";
import { now } from "./utils";
import { INIT_GAME, CLOCK_UPDATE, GAME_OVER } from "./message";
import {
  saveGameState,
  appendMove,
  markGameFinished,
  type MoveRecord,
} from "./redisStore";

export class Game {
  public player1: WebSocket;           // white
  public player2: WebSocket;           // black
  public player1Name: string;
  public player2Name: string;
  public board: Chess;
  public id: string;
  public whiteTime: number;
  public blackTime: number;
  public activePlayer: "white" | "black";
  public lastMoveTimestamp: number;
  public isFinished: boolean = false;

  constructor(
    p1: WebSocket,
    p2: WebSocket,
    p1Name: string,
    p2Name: string,
    time: number,
    // Optional: restore from existing state (reconnect scenario)
    existingId?: string,
    existingFen?: string,
    existingWhiteTime?: number,
    existingBlackTime?: number,
    existingActivePlayer?: "white" | "black",
    existingLastMoveTimestamp?: number
  ) {
    this.player1 = p1;
    this.player2 = p2;
    this.player1Name = p1Name;
    this.player2Name = p2Name;
    this.board = existingFen ? new Chess(existingFen) : new Chess();
    this.id = existingId ?? randomUUID();

    this.whiteTime = existingWhiteTime ?? time;
    this.blackTime = existingBlackTime ?? time;
    this.activePlayer = existingActivePlayer ?? "white";
    this.lastMoveTimestamp = existingLastMoveTimestamp ?? now();

    // Persist initial game state to Redis
    this.persistState().catch((err) =>
      console.error("[Redis] Failed to persist initial game state:", err)
    );

    // INIT signals
    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        color: "white",
        id: this.id,
        opponentName: p2Name,
      })
    );

    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        color: "black",
        id: this.id,
        opponentName: p1Name,
      })
    );

    this.broadcastClock();
    this.startClockMonitor();
  }

  // ──────────────────────────────────────────────
  // REDIS PERSISTENCE
  // ──────────────────────────────────────────────

  /** Snapshot current in-memory state → Redis (source of truth) */
  async persistState(): Promise<void> {
    await saveGameState({
      id: this.id,
      fen: this.board.fen(),
      whiteTime: this.whiteTime,
      blackTime: this.blackTime,
      activePlayer: this.activePlayer,
      lastMoveTimestamp: this.lastMoveTimestamp,
      isFinished: this.isFinished,
      createdAt: Date.now(),
    });
  }

  // ──────────────────────────────────────────────
  // CLOCK
  // ──────────────────────────────────────────────

  private updateClock() {
    const elapsed = now() - this.lastMoveTimestamp;

    if (this.activePlayer === "white") {
      this.whiteTime -= elapsed;
    } else {
      this.blackTime -= elapsed;
    }

    this.lastMoveTimestamp = now();
  }

  private broadcastClock() {
    const payload = JSON.stringify({
      type: CLOCK_UPDATE,
      clock: {
        whiteTime: this.whiteTime,
        blackTime: this.blackTime,
        activePlayer: this.activePlayer,
        lastMoveTimestamp: this.lastMoveTimestamp,
      },
      serverTime: now(),
    });

    this.player1.send(payload);
    this.player2.send(payload);
  }

  private startClockMonitor() {
    const interval = setInterval(() => {
      if (this.isFinished) return clearInterval(interval);

      const elapsed = now() - this.lastMoveTimestamp;

      const remaining =
        this.activePlayer === "white"
          ? this.whiteTime - elapsed
          : this.blackTime - elapsed;

      if (remaining <= 0) {
        this.isFinished = true;

        const winner =
          this.activePlayer === "white" ? "black" : "white";

        const result = `${winner} wins on time`;
        const payload = JSON.stringify({ type: GAME_OVER, result });

        this.player1.send(payload);
        this.player2.send(payload);

        markGameFinished(this.id, result).catch((err) =>
          console.error("[Redis] Failed to mark game finished:", err)
        );

        clearInterval(interval);
      }
    }, 200);
  }

  // ──────────────────────────────────────────────
  // MOVE
  // ──────────────────────────────────────────────

  async makeMove(socket: WebSocket, move: { from: string; to: string; promotion?: string }) {
    if (this.isFinished) return;

    // Turn validation
    if (
      (this.board.turn() === "w" && socket !== this.player1) ||
      (this.board.turn() === "b" && socket !== this.player2)
    ) {
      return;
    }

    this.updateClock();

    // Apply the move
    const result = this.board.move(move);
    if (!result) return;

    // Check timeout
    if (this.whiteTime <= 0 || this.blackTime <= 0) {
      this.isFinished = true;
      return;
    }

    // Switch turn
    this.activePlayer = this.activePlayer === "white" ? "black" : "white";

    // ── Persist to Redis (source of truth) ──
    const moveRecord: MoveRecord = {
      from: result.from,
      to: result.to,
      promotion: result.promotion,
      san: result.san,
      fen: this.board.fen(),
      color: result.color,
      timestamp: now(),
    };

    try {
      // Run both persists concurrently
      await Promise.all([
        appendMove(this.id, moveRecord),
        this.persistState(),
      ]);
    } catch (err) {
      console.error("[Redis] Failed to persist move:", err);
      // Non-fatal: in-memory state is still correct
    }

    this.broadcastClock();

    // Send move to opponent
    const opponent = socket === this.player1 ? this.player2 : this.player1;
    opponent.send(
      JSON.stringify({
        type: "opponent_move",
        move,
        fen: this.board.fen(),
      })
    );
  }

  // ──────────────────────────────────────────────
  // RECONNECT: swap a stale socket for a live one
  // ──────────────────────────────────────────────

  reconnectPlayer(oldSocket: WebSocket, newSocket: WebSocket): "white" | "black" | null {
    if (this.player1 === oldSocket) {
      this.player1 = newSocket;
      return "white";
    }
    if (this.player2 === oldSocket) {
      this.player2 = newSocket;
      return "black";
    }
    return null;
  }

  // ──────────────────────────────────────────────
  // RESIGN
  // ──────────────────────────────────────────────

  async handleResign(winnerName: string, loserName: string) {
    this.isFinished = true;

    const result = `${winnerName} wins by resignation`;
    const payload = JSON.stringify({ type: GAME_OVER, result });

    this.player1.send(payload);
    this.player2.send(payload);

    try {
      await markGameFinished(this.id, result);
    } catch (err) {
      console.error("[Redis] Failed to mark resign in Redis:", err);
    }
  }
}