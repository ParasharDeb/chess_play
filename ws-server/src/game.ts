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
    public player1Rating?: number;
    public player2Rating?: number;

    constructor(player1: WebSocket, player2: WebSocket, player1Name: string, player2Name: string, player1Rating?: number, player2Rating?: number) {
        this.player1 = player1;
        this.player2 = player2;
        this.player1Name = player1Name;
        this.player2Name = player2Name;
        this.player1Rating = player1Rating ?? undefined;
        this.player2Rating = player2Rating ?? undefined;
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
                opponent: this.player2Name,
                youRating: this.player1Rating ?? null,
                opponentRating: this.player2Rating ?? null,
            })
        );
        this.player2.send(
            JSON.stringify({
                type: INIT_GAME,
                color: "black",
                id: this.id,
                you: this.player2Name,
                opponent: this.player1Name,
                youRating: this.player2Rating ?? null,
                opponentRating: this.player1Rating ?? null,
            })
        );
    }
    public async handleResign(winnerName:string,loserName:string){
        try {
            // apply rating changes
            const winnerChange = 8;
            const loserChange = -7;

            await UserModel.updateOne({ name: winnerName }, { $inc: { rating: winnerChange } });
            await UserModel.updateOne({ name: loserName }, { $inc: { rating: loserChange } });

            // fetch updated ratings
            const winnerDoc = await UserModel.findOne({ name: winnerName }).select('name rating');
            const loserDoc = await UserModel.findOne({ name: loserName }).select('name rating');

            const payload = {
                type: "match_ended",
                result: "resigned",
                winnerName,
                loserName,
                winnerRating: winnerDoc?.rating ?? null,
                loserRating: loserDoc?.rating ?? null,
                ratingChange: { winner: winnerChange, loser: loserChange }
            };

            this.player1.send(JSON.stringify(payload));
            this.player2.send(JSON.stringify(payload));
        } catch (error) {
            console.log("DB is down", error);
            // fallback: still notify clients without rating info
            this.player1.send(JSON.stringify({ type: "match_ended", result: "resigned" }));
            this.player2.send(JSON.stringify({ type: "match_ended", result: "resigned" }));
        }
    }
    async makeMove(socket: WebSocket,
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
            // If it's a checkmate, update ratings similarly to a decisive win.
            if (this.board.isCheckmate()) {
                const winnerColor = this.board.turn() == 'w' ? 'black' : 'white';
                const winnerName = winnerColor === 'white' ? this.player1Name : this.player2Name;
                const loserName = winnerColor === 'white' ? this.player2Name : this.player1Name;

                const winnerChange = 8;
                const loserChange = -7;

                try {
                    await UserModel.updateOne({ name: winnerName }, { $inc: { rating: winnerChange } });
                    await UserModel.updateOne({ name: loserName }, { $inc: { rating: loserChange } });

                    const winnerDoc = await UserModel.findOne({ name: winnerName }).select('name rating');
                    const loserDoc = await UserModel.findOne({ name: loserName }).select('name rating');

                    const payload = JSON.stringify({
                        type: "game_over",
                        result: result,
                        winnerName,
                        loserName,
                        winnerRating: winnerDoc?.rating ?? null,
                        loserRating: loserDoc?.rating ?? null,
                        ratingChange: { winner: winnerChange, loser: loserChange }
                    });

                    this.player1.send(payload);
                    this.player2.send(payload);
                    return;
                } catch (err) {
                    console.log('DB error updating ratings:', err);
                }
            }

            // non-decisive endings: just send the game_over message
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
