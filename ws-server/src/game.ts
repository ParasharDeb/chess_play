import { WebSocket } from "ws";
import { INIT_GAME } from "./message";
import { Chess } from "chess.js";
import { randomUUID } from "crypto";
import { UserModel } from "@repo/database";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    public board: Chess;
    public starttime: Date;
    public fen: string;
    public id: string;
    public player1Name: string;
    public player2Name: string;


    constructor(player1: WebSocket, player2: WebSocket, player1Name: string, player2Name: string) {
        this.player1 = player1;
        this.player2 = player2;
        this.player1Name = player1Name;
        this.player2Name = player2Name;
        this.board = new Chess();
        this.starttime = new Date();
        this.id = randomUUID();
        this.fen = this.board.fen();


        this.player1.send(
            JSON.stringify({
                type: INIT_GAME,
                color: "white",
                id: this.id,
                you: this.player1Name,
                opponent: this.player2Name
            })
        );
        this.player2.send(
            JSON.stringify({
                type: INIT_GAME,
                color: "black",
                id: this.id,
                you: this.player2Name,
                opponent: this.player1Name
            })
        );
    }
    public async handleResign(winnerName:string,loserName:string){
        try {
                        const winner = await UserModel.updateOne({name:winnerName},{$inc:{rating:8}} )
                    const loser = await UserModel.updateOne({name:loserName},{$inc:{rating:-7}})
                    if(!winner || !loser){
                        this.player1.send(JSON.stringify({type:"match_ended",result:"it is a draw"}))
                        this.player2.send(JSON.stringify({type:"match_ended",result:"it is a draw"}))
                        
                    }
                    this.player1.send(JSON.stringify({type:"match_ended",result:"resigned"}))
                    this.player2.send(JSON.stringify({type:"match_ended",result:"resigned"}))
                    } catch (error) {
                        console.log("DB is down")
                    }
    }
    makeMove(socket: WebSocket,
        move: {
            from: string,
            to: string
            promotion?: string
        }
    ) {

        // check if it is the player's move 
        if ((this.board.turn() == 'w' && socket !== this.player1) ||
            (this.board.turn() == 'b' && socket !== this.player2)
        ) {
            socket.send(JSON.stringify({ type: "error", message: "Not your turn" }));
            return;
        }

        // is the move valid (chess.js returns null for invalid moves)
        try {
            const result = this.board.move(move);
            if (!result) return; // optional: invalid move protection
            this.fen = this.board.fen();
            console.log(this.board.history())
            socket.send(JSON.stringify({type:"move_history",history:this.board.history()}))
            const opponent = socket === this.player1 ? this.player2 : this.player1;
            opponent.send(JSON.stringify({type:"move_history",history:this.board.history()})
        );

        } catch (e) {
            console.log("error here")
            console.log(e);
        }

        // check if game is over
        if (this.board.isGameOver()) {
            // notify both players that game is over
            const result = this.board.isCheckmate() ?
                (this.board.turn() == 'w' ? "black" : "white") + " wins by checkmate"
                : this.board.isStalemate() ? "draw by stalemate"
                    : this.board.isInsufficientMaterial() ? "draw by insufficient material"
                        : this.board.isThreefoldRepetition() ? "draw by threefold repetition"
                            : "draw";
            const gameOverMessage = JSON.stringify({
                type: "game_over",
                result: result
            });
            this.player1.send(gameOverMessage);
            this.player2.send(gameOverMessage);
            return;
        }

        // send the move to the opponent
        const opponent = socket === this.player1 ? this.player2 : this.player1;
        opponent.send(
            JSON.stringify({
                type: "opponent_move",
                move: move,
                fen: this.fen
            })
        );
    }
}
