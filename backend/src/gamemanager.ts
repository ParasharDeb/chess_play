import { WebSocket } from "ws"

export class GameManager{
    private game:game[]
    private pendinguser:WebSocket
    private user: WebSocket[]
    constructor(){
        this.game=[]
    }
    addUser(ws:WebSocket){
        this.user.push(ws)
        if(this.pendinguser){
            //logic to start the game
        }
        else{
            this.pendinguser=ws
        }
    }
    removeUser(ws:WebSocket){
        this.user=this.user.filter(user=>user!==ws)
        //logic to stop the game here
    }
}