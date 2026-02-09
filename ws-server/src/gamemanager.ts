import { WebSocket } from "ws";
import { Game } from "./game";
import { AUTH, INIT_GAME, MOVE, WAITING } from "./message";
import { GamesModel, UserModel } from "@repo/database";
export class GameManager {
    private waitingplayer: WebSocket | null;
    private games:Game[]
    private users: WebSocket[];
    // Track usernames associated with each socket
    private usernames: Map<WebSocket, string>;

    constructor() {
        this.games=[]
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
        socket.on("message", async(data) => {
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
                    const player1Name = this.usernames.get(this.waitingplayer) ;
                    if(!player1Name){
                        socket.send("express server is down")
                        return
                    }
                    const player2Name = this.usernames.get(socket) ;
                    if(!player2Name){
                        socket.send("express server is down")
                        return
                    }
                    const player1ID=await UserModel.findOne({name:player1Name})
                    const player2ID=await UserModel.findOne({name:player2Name})
                    const game = new Game(
                        this.waitingplayer,
                        socket,
                        player1Name,
                        player2Name
                    );
                    this.games.push(game)
                    try {
                        const game=await GamesModel.create({
                            whiteplayer:player1ID,
                            blackplayer:player2ID,

                        })
                        console.log(game.id)
                        
                    } catch (error) {
                        console.log(error)
                        return
                    }
                    this.waitingplayer = null;
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