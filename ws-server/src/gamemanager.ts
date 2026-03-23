import { WebSocket } from "ws";
import { Game } from "./game";
import { INIT_GAME, MOVE, WAITING, AUTH, ENDGAME } from "./message";

export class GameManager {
  private waitingPlayer: WebSocket | null = null;
  private games: Game[] = [];
  private socketToGame = new Map<WebSocket, Game>();
  private usernames = new Map<WebSocket, string>();

  addUser(socket: WebSocket) {
    this.addHandler(socket);
  }

  removeUser(socket: WebSocket) {
    this.socketToGame.delete(socket);
    this.usernames.delete(socket);

    if (this.waitingPlayer === socket) {
      this.waitingPlayer = null;
    }
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", async (data) => {
      const message = JSON.parse(data.toString());

      // AUTH
      if (message.type === AUTH) {
        this.usernames.set(socket, message.username);
        return;
      }

      // INIT GAME
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

          this.games.push(game);
          this.socketToGame.set(player1, game);
          this.socketToGame.set(player2, game);

          this.waitingPlayer = null;
        }
      }

      // MOVE
      if (message.type === MOVE) {
        const game = this.socketToGame.get(socket);
        if (game) {
          game.makeMove(socket, message.move);
        }
      }

      // ENDGAME
      if (message.type === ENDGAME) {
        console.log("reached endgame")
        const game = this.socketToGame.get(socket);
        console.log("game found")
        if (game) {
          await game.handleResign(message.winnerName, message.loserName);
        }
      }
    });
  }
}