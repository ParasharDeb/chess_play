import { WebSocket } from "ws"
import { INIT_GAME, MOVE } from "./message"
import { Game } from "./game"

export class GameManager{
    private games:Game[]
    private pendinguser:WebSocket | null
    private user: WebSocket[]
    constructor(){
        this.games=[]
        this.pendinguser=null
        this.user=[]
    }
    addUser(ws:WebSocket){
        this.user.push(ws)
        this.messageHandler(ws)
    }
    removeUser(ws:WebSocket){
        this.user=this.user.filter(user=>user!==ws)
        //logic to stop the game here cause user disconnected
    }
    private messageHandler(ws:WebSocket){
        ws.on('message',(data)=>{
            const message=JSON.parse(data.toString());
            if(message===INIT_GAME){
                if(this.pendinguser){
                    const game= new Game(this.pendinguser,ws)
                    this.games.push(game)
                    this.pendinguser=null
                }
                else{
                this.pendinguser=ws
                }
            }
            if(message==MOVE){
                const game=this.games.find(game=>game.player1==ws || game.player2==ws)
                if(game){
                    game.makeMove(ws,message.move)
                }
            }
        })
    }
}