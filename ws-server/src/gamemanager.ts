import { WebSocket } from "ws";
import { Game } from "./game";
import { AUTH, INIT_GAME, MOVE, WAITING } from "./message";

export class GameManager {
    private waitingplayer: WebSocket | null;
    private games: Game[];
    private users: WebSocket[];
    // Track usernames associated with each socket
    private usernames: Map<WebSocket, string>;

    constructor() {
        this.games = [];    // should not be an in-memory variable in production
        this.waitingplayer = null;
        this.users = [];
        this.usernames = new Map();
    }

    addUser(socket: WebSocket) {
        this.users.push(socket);
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter(user => user !== socket);
        this.usernames.delete(socket);
    }

    private addHandler(socket: WebSocket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());

            if (message.type === AUTH) {
                if (typeof message.username === "string") {
                    this.usernames.set(socket, message.username);
                }
                return;
            }

            if (message.type === INIT_GAME) {
                console.log("reached here");
                if (!this.waitingplayer) {
                    this.waitingplayer = socket;
                    socket.send(
                        JSON.stringify({
                            type: WAITING,
                        }))
                    console.log("waiting");
                }
                else if (this.waitingplayer && this.waitingplayer != socket) {
                    const player1Name = this.usernames.get(this.waitingplayer) ?? "Player 1";
                    const player2Name = this.usernames.get(socket) ?? "Player 2";

                    const game = new Game(
                        this.waitingplayer,
                        socket,
                        player1Name,
                        player2Name
                    );
                    this.games.push(game);
                    this.waitingplayer = null;
                    console.log(this.waitingplayer);
                    console.log(game.id);
                }
            }

            if (message.type === MOVE) {
                const game = this.games.find(g => g.player1 === socket || g.player2 === socket);
                if (game) {
                    game.makeMove(socket, message.move);
                }
            }
        })
    }
}