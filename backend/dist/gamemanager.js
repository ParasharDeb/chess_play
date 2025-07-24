"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const message_1 = require("./message");
const game_1 = require("./game");
class GameManager {
    constructor() {
        this.games = [];
        this.pendinguser = null;
        this.user = [];
    }
    addUser(ws) {
        this.user.push(ws);
        this.messageHandler(ws);
    }
    removeUser(ws) {
        this.user = this.user.filter(user => user !== ws);
        //logic to stop the game here cause user disconnected
    }
    messageHandler(ws) {
        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === message_1.INIT_GAME) {
                console.log("hi");
                if (this.pendinguser) {
                    const game = new game_1.Game(this.pendinguser, ws);
                    this.games.push(game);
                    this.pendinguser = null;
                }
                else {
                    this.pendinguser = ws;
                }
            }
            if (message.type == message_1.MOVE) {
                console.log("move");
                const game = this.games.find(game => game.player1 == ws || game.player2 == ws);
                console.log("found game");
                if (game) {
                    game.makeMove(ws, message.move);
                }
            }
        });
    }
}
exports.GameManager = GameManager;
