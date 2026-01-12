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
            const message=JSON.parse(data.toString()) // here didnt understand what data gives us is data a string an object??

            if(message.type==INIT_GAME){
                if(this.waitingplayer){
                    const game = new Game(this.waitingplayer,socket)
                    this.games.push(game);
                    this.waitingplayer=null
                    
                }
                else{
                    this.waitingplayer=socket
                    
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