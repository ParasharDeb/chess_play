import { WebSocket } from "ws";
import { Game } from "./game";
import {
  INIT_GAME,
  MOVE,
  WAITING,
  AUTH,
  ENDGAME,
  RECONNECT,
  RECONNECT_SUCCESS,
  GET_HISTORY,
} from "./message";
import {
  loadGameState,
  loadMoves,
  type GameState,
} from "./redisStore";

export class GameManager {
  private waitingPlayer: WebSocket | null = null;

  /** In-memory map: gameId → Game instance */
  private games = new Map<string, Game>();

  /** In-memory map: socket → Game */
  private socketToGame = new Map<WebSocket, Game>();

  /** In-memory map: socket → username */
  private usernames = new Map<WebSocket, string>();

  /** In-memory map: gameId → reconnecting socket (while one player is offline) */
  private pendingReconnect = new Map<string, WebSocket>();

  addUser(socket: WebSocket) {
    this.addHandler(socket);
  }

  removeUser(socket: WebSocket) {
    const game = this.socketToGame.get(socket);

    this.socketToGame.delete(socket);
    this.usernames.delete(socket);

    if (this.waitingPlayer === socket) {
      this.waitingPlayer = null;
    }

    // If the socket was in a game, keep the Game alive so the other player
    // can continue and the disconnected player can reconnect.
    if (game) {
      this.pendingReconnect.set(game.id, socket);
      console.log(`[GameManager] Player disconnected from game ${game.id}. Awaiting reconnect.`);
    }
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", async (data) => {
      let message: any;
      try {
        message = JSON.parse(data.toString());
      } catch {
        console.error("[GameManager] Failed to parse message");
        return;
      }

      // ── AUTH ──────────────────────────────────────────────────────────────
      if (message.type === AUTH) {
        this.usernames.set(socket, message.username);
        return;
      }

      // ── RECONNECT ─────────────────────────────────────────────────────────
      // Client sends: { type: "reconnect", gameId: "<uuid>" }
      if (message.type === RECONNECT) {
        const gameId: string = message.gameId;
        if (!gameId) return;

        // 1. Try to find the game in memory first
        let game = this.games.get(gameId);

        if (game) {
          // Game still live — find which socket we're replacing
          const oldSocket = this.pendingReconnect.get(gameId);
          if (oldSocket) {
            const color = game.reconnectPlayer(oldSocket, socket);
            if (color) {
              this.socketToGame.set(socket, game);
              this.pendingReconnect.delete(gameId);

              // Send full state + move history so client can catch up
              const moves = await loadMoves(gameId);
              socket.send(
                JSON.stringify({
                  type: RECONNECT_SUCCESS,
                  color,
                  gameId,
                  fen: game.board.fen(),
                  clock: {
                    whiteTime: game.whiteTime,
                    blackTime: game.blackTime,
                    activePlayer: game.activePlayer,
                    lastMoveTimestamp: game.lastMoveTimestamp,
                  },
                  moves,
                })
              );
              console.log(`[GameManager] Player reconnected to game ${gameId} as ${color}`);
            }
          } else {
            socket.send(JSON.stringify({ type: "error", message: "No pending reconnect slot" }));
          }
        } else {
          // 2. Game not in memory — restore from Redis (server restart scenario)
          const state: GameState | null = await loadGameState(gameId);
          if (!state || state.isFinished) {
            socket.send(JSON.stringify({ type: "error", message: "Game not found or already finished" }));
            return;
          }

          // We need both players to reconnect. Park this socket until the partner arrives.
          if (!this.pendingReconnect.has(gameId)) {
            this.pendingReconnect.set(gameId, socket);
            socket.send(JSON.stringify({ type: WAITING, message: "Waiting for opponent to reconnect" }));
          } else {
            // Partner is already waiting — rebuild the Game
            const partnerSocket = this.pendingReconnect.get(gameId)!;
            this.pendingReconnect.delete(gameId);

            const moves = await loadMoves(gameId);

            // Rebuild Chess board by replaying moves
            const { Chess } = await import("chess.js");
            const board = new Chess();
            for (const m of moves) {
              board.move({ from: m.from, to: m.to, promotion: m.promotion });
            }

            // Determine which socket is white/black from the game state perspective.
            // We assign: first reconnector = white (player1), second = black (player2)
            // In a real app you'd persist the player→color mapping in Redis too.
            const restoredGame = new Game(
              partnerSocket,
              socket,
              "P1",
              "P2",
              0,
              state.id,
              state.fen,
              state.whiteTime,
              state.blackTime,
              state.activePlayer,
              state.lastMoveTimestamp
            );

            this.games.set(gameId, restoredGame);
            this.socketToGame.set(partnerSocket, restoredGame);
            this.socketToGame.set(socket, restoredGame);

            const moveHistory = moves;

            const clockPayload = {
              whiteTime: state.whiteTime,
              blackTime: state.blackTime,
              activePlayer: state.activePlayer,
              lastMoveTimestamp: state.lastMoveTimestamp,
            };

            partnerSocket.send(
              JSON.stringify({
                type: RECONNECT_SUCCESS,
                color: "white",
                gameId,
                fen: state.fen,
                clock: clockPayload,
                moves: moveHistory,
              })
            );
            socket.send(
              JSON.stringify({
                type: RECONNECT_SUCCESS,
                color: "black",
                gameId,
                fen: state.fen,
                clock: clockPayload,
                moves: moveHistory,
              })
            );
            console.log(`[GameManager] Restored game ${gameId} from Redis`);
          }
        }
        return;
      }

      // ── INIT GAME ─────────────────────────────────────────────────────────
      if (message.type === INIT_GAME) {
        if (!this.waitingPlayer) {
          this.waitingPlayer = socket;
          socket.send(JSON.stringify({ type: WAITING }));
          return;
        }

        if (this.waitingPlayer !== socket) {
          const player1 = this.waitingPlayer;
          const player2 = socket;

          const game = new Game(
            player1,
            player2,
            this.usernames.get(player1) || "P1",
            this.usernames.get(player2) || "P2",
            600000 // 10 min
          );

          this.games.set(game.id, game);
          this.socketToGame.set(player1, game);
          this.socketToGame.set(player2, game);

          this.waitingPlayer = null;
        }
        return;
      }

      // ── GET_HISTORY ────────────────────────────────────────────────────────
      // Client sends: { type: "get_history" }
      // Server responds with SANs from Redis + opponent name
      if (message.type === GET_HISTORY) {
        const game = this.socketToGame.get(socket);
        if (!game) {
          socket.send(JSON.stringify({ type: "move_history", history: [], opponentName: "Opponent" }));
          return;
        }

        const moves = await loadMoves(game.id);
        const history = moves.map((m) => m.san);

        const opponentSocket = game.player1 === socket ? game.player2 : game.player1;
        const opponentName = this.usernames.get(opponentSocket) ?? "Opponent";

        socket.send(
          JSON.stringify({
            type: "move_history",
            history,
            opponentName,
          })
        );
        return;
      }

      // ── MOVE ──────────────────────────────────────────────────────────────
      if (message.type === MOVE) {
        const game = this.socketToGame.get(socket);
        if (game) {
          await game.makeMove(socket, message.move);
        }
        return;
      }

      // ── ENDGAME (resign) ──────────────────────────────────────────────────
      if (message.type === ENDGAME) {
        console.log("[GameManager] ENDGAME message received");
        const game = this.socketToGame.get(socket);
        if (game) {
          await game.handleResign(message.winnerName, message.loserName);
          this.games.delete(game.id);
        }
      }
    });
  }
}