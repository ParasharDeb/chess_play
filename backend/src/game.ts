import { WebSocket } from "ws";
import { INIT_GAME } from "./message";
import { Chess } from "chess.js";
import {randomUUID} from "crypto"
export class Game{
    public player1:WebSocket
    public player2:WebSocket
    public board:Chess
    public starttime:Date
    public fen:String
    public id:string
    constructor(player1:WebSocket,player2:WebSocket){
        this.player1=player1,
        this.player2=player2
        this.board=new Chess()
        this.starttime=new Date()
        this.id=randomUUID()
        this.fen= this.board.fen()
        this.player1.send(
            JSON.stringify({
                "type":INIT_GAME,
                "payload":{
                    color:"white",
                    id:this.id
                }
            })
        )
        this.player2.send(
            JSON.stringify({
                "type":INIT_GAME,
                "color":"black",
                "id":this.id
                
            })
        )
    }
    makeMove(socket:WebSocket,
        move:{
        from:string,
        to:string
        promotion?:string
        }
    ){

        //check if it is the players move 
        if((this.board.turn()=='w' && socket!==this.player1) ||
        (this.board.turn()=='b' && socket!==this.player2)
        ){
            socket.send(JSON.stringify({ type: "error", message: "Not your turn" }));
            return
        }

        //is the move valid (chess.js returns null for invalid moves)
        try {
  const result = this.board.move(move);
  if (!result) return; // optional: invalid move protection

          
  this.fen = this.board.fen();

} catch (e) {
  console.log(e);
}
        

        //check if game is over
        if(this.board.isGameOver()){
            // notify both players that game is over
            const result = this.board.isCheckmate() ? 
            (this.board.turn()=='w' ? "black":"white")+" wins by checkmate"
            : this.board.isStalemate() ? "draw by stalemate"
            : this.board.isInsufficientMaterial() ? "draw by insufficient material"
            : this.board.isThreefoldRepetition() ? "draw by threefold repetition"
            : "draw"
            const gameOverMessage = JSON.stringify({
                type:"game_over",
                result:result
            })
            this.player1.send(gameOverMessage)
            this.player2.send(gameOverMessage)
            return
        }

        //send the move to the opponent
        const opponent = socket === this.player1 ? this.player2 : this.player1
        opponent.send(
            JSON.stringify({
                type: "opponent_move",
                move: move,
                fen: this.fen
            })
        )
    }
}
