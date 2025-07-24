import { WebSocket } from "ws"
import { INIT_GAME } from "./message"

export class GameManager{
    private game:game[]
    private pendinguser:WebSocket
    private user: WebSocket[]
    constructor(){
        this.game=[]
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
                //logic to start the game
                }
                else{
                this.pendinguser=ws
                }
            }
        })
    }
}