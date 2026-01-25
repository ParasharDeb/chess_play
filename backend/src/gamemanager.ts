import { WebSocket } from "ws";
import { Game } from "./game";
import { INIT_GAME, MOVE } from "./message";
export class GameManager{
    private waitingplayer:WebSocket|null;
    private games:Game[]
    private users:WebSocket[]
    constructor(){
        this.games=[]    // should not be a in memeory varibale
        this.waitingplayer=null
        this.users=[]    //didnt understand why this is empty**
    }
    addUser(socket:WebSocket){
        this.users.push(socket);
        this.addHandler(socket)
    }
    removeUser(socket:WebSocket){
        this.users=this.users.filter(user=>user!== socket)
    }
    private addHandler(socket:WebSocket){
        socket.on("message",(data)=>{
            const message=JSON.parse(data.toString()) 

            if(message.type==INIT_GAME){
                console.log("reacher here")
                if(this.waitingplayer){
                    const game = new Game(this.waitingplayer,socket)
                    this.games.push(game);
                    this.waitingplayer=null
                    
                }
                else{
                    this.waitingplayer=socket
                    socket.send(
                        JSON.stringify({
                            "type":INIT_GAME,
                            "payload":{
                            color:"white"
                            }
                        }))
                }
            }
            if(message.type==MOVE){
                const game = this.games.find(g=>g.player1===socket || g.player2===socket)
                if(game){
                    game.makeMove(socket,message.move)
                }
            }
        })
    }
}