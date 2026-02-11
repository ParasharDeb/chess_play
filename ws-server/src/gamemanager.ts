import { WebSocket } from "ws";
import { Game } from "./game";
import { AUTH, INIT_GAME, MOVE, WAITING } from "./message";
import { GamesModel, UserModel } from "@repo/database";

export class GameManager {
    private waitingplayer: WebSocket | null;
    private games: Game[];
    private users: WebSocket[];
    private usernames: Map<WebSocket, string>;

    constructor() {
        this.games = [];
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

        if (this.waitingplayer === socket) {
            this.waitingplayer = null;
        }
    }

    private addHandler(socket: WebSocket) {
        socket.on("message", async (data) => {
            try {
                const message = JSON.parse(data.toString());

                // ================= AUTH =================
                if (message.type === AUTH) {
                    if (typeof message.username === "string") {
                        this.usernames.set(socket, message.username);
                    }
                    return;
                }

                // ================= INIT GAME =================
                if (message.type === INIT_GAME) {
                    console.log("INIT_GAME received");

                    // First player waits
                    if (!this.waitingplayer) {
                        this.waitingplayer = socket;

                        socket.send(JSON.stringify({
                            type: WAITING,
                        }));

                        console.log("Player waiting...");
                        return;
                    }

                    // Second player joins
                    if (this.waitingplayer !== socket) {
                        const player1Name = this.usernames.get(this.waitingplayer);
                        const player2Name = this.usernames.get(socket);

                        if (!player1Name || !player2Name) {
                            socket.send("Auth required");
                            return;
                        }

                        // Fetch ONLY _id for efficiency
                        const player1 = await UserModel
                            .findOne({ name: player1Name })
                            .select("_id");

                        if (!player1) {
                            socket.send("Player1 not found");
                            return;
                        }

                        const player2 = await UserModel
                            .findOne({ name: player2Name })
                            .select("_id");

                        if (!player2) {
                            socket.send("Player2 not found");
                            return;
                        }

                        // Create in-memory game
                        const gameInstance = new Game(
                            this.waitingplayer,
                            socket,
                            player1Name,
                            player2Name
                        );

                        this.games.push(gameInstance);

                        // Save to DB
                        try {
                            const dbGame = await GamesModel.create({
                                whiteplayer: player1._id,
                                blackplayer: player2._id,
                            });

                            console.log("DB Game created:", dbGame.id);
                        } catch (error) {
                            console.log("DB error:", error);
                            return;
                        }

                        this.waitingplayer = null;
                    }

                    return;
                }

                // ================= MOVE =================
                if (message.type === MOVE) {
                    const game = this.games.find(
                        g => g.player1 === socket || g.player2 === socket
                    );

                    if (game) {
                        game.makeMove(socket, message.move);
                    }
                }

            } catch (err) {
                console.log("Invalid message:", err);
            }
        });
    }
}
