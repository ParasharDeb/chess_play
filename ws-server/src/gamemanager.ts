import { WebSocket } from "ws";
import { Game } from "./game";
import { AUTH, ENDGAME, INIT_GAME, MOVE, WAITING } from "./message";
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
                // if (message.type === AUTH) {
                //     if (typeof message.username === "string") {
                //         this.usernames.set(socket, message.username);
                //     }
                //     return;
                // }

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
                    
                    try {

                        const gameInstance = new Game(
                            this.waitingplayer,
                            socket,
                            "player1Name",
                            "player2Name",
                            1600,
                            1700
                        );
                        console.log("game started")
                        
                        
                        this.games.push(gameInstance);

                        // // Save to DB
                        // try {
                        //     const dbGame = await GamesModel.create({
                        //         whiteplayer: "123",
                        //         blackplayer: "345",
                        //     });

                        //     console.log("DB Game created:", dbGame.id);
                        // } catch (error) {
                        //     console.log("DB error:", error);
                        //     return;
                        // }

                        this.waitingplayer = null;
                    } catch (error) {
                        console.error("Game creation error:", error);
                    
                    }
                }

                    // return;
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

                if (message.type === ENDGAME) {
                    console.log("started ending game")
                    const winnerName = message.winnerName
                    const loserName = message.loserName
                    
                    const game = this.games.find(
                        g => g.player1 === socket || g.player2 === socket
                    );

                    if (game) {
                        await game.handleResign(winnerName, loserName);

                        this.games = this.games.filter(g => g.id !== game.id);
                    }
                }
                

            } catch (err) {
                console.log("Invalid message:", err);
            }
        });
    }
}