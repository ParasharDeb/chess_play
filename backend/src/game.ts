import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./message";
export class Game {
    public player1:WebSocket
    public player2:WebSocket
    private board:Chess
    private startTime:Date
    constructor(player1:WebSocket,player2:WebSocket){
        this.player1=player1
        this.player2=player2
        this.board=new Chess()
        this.startTime=new Date()
        this.player1.send(JSON.stringify({
            type:INIT_GAME,
            payload:{
                color:"White"
            }
        }))
        this.player2.send(JSON.stringify({
            type:INIT_GAME,
            payload:{
                color:"Black"
            }
        }))
    }
    makeMove(socket:WebSocket,move:{from:string,to:string})  {

        try{
            this.board.move(move)
            console.log(move)
        }
        catch(e){
            return
        }
        if(this.board.isGameOver()){
            this.player1.emit(JSON.stringify({
                type:GAME_OVER,
                payload:{
                    winner:this.board.turn()==="w"?"black":"white"
                }
            }))
            return;
        }
        if(this.board.moves().length%2===0){
            this.player2.send(JSON.stringify({
                type:MOVE,
                payload:move
            }))

        }else{
            console.log("did not reach here")
            this.player1.send(JSON.stringify({
                type:MOVE,
                payload:move 
            }))
        }


    }   
}