import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { randomUUID } from "crypto";
import { now } from "./utils";
import { INIT_GAME, CLOCK_UPDATE, GAME_OVER } from "./message";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
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
    time: number
  ) {
    this.player1 = p1;
    this.player2 = p2;
    this.board = new Chess();
    this.id = randomUUID();

    this.whiteTime = time;
    this.blackTime = time;
    this.activePlayer = "white";
    this.lastMoveTimestamp = now();

    // INIT
    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        color: "white",
        id: this.id,
      })
    );

    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        color: "black",
        id: this.id,
      })
    );

    this.broadcastClock();
    this.startClockMonitor();
  }

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

        const payload = JSON.stringify({
          type: GAME_OVER,
          result: `${winner} wins on time`,
        });

        this.player1.send(payload);
        this.player2.send(payload);

        clearInterval(interval);
      }
    }, 200);
  }

  makeMove(socket: WebSocket, move: any) {
    if (this.isFinished) return;

    // TURN VALIDATION
    if (
      (this.board.turn() === "w" && socket !== this.player1) ||
      (this.board.turn() === "b" && socket !== this.player2)
    ) {
      return;
    }

    this.updateClock();

    // MOVE
    const result = this.board.move(move);
    if (!result) return;

    // CHECK TIMEOUT
    if (this.whiteTime <= 0 || this.blackTime <= 0) {
      this.isFinished = true;
      return;
    }

    // SWITCH TURN
    this.activePlayer =
      this.activePlayer === "white" ? "black" : "white";

    this.broadcastClock();

    // SEND MOVE
    const opponent =
      socket === this.player1 ? this.player2 : this.player1;

    opponent.send(
      JSON.stringify({
        type: "opponent_move",
        move,
        fen: this.board.fen(),
      })
    );
  }

  async handleResign(winnerName: string, loserName: string) {
    this.isFinished = true;

    const payload = JSON.stringify({
      type: GAME_OVER,
      result: `${winnerName} wins by resignation`,
    });

    this.player1.send(payload);
    this.player2.send(payload);
  }
}