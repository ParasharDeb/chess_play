import { WebSocketServer } from "ws";
import { GameManager } from "./gamemanager";
const wss = new WebSocketServer({port:8080})
const gameManager=new GameManager()
wss.on('connection',function connection(ws){
    gameManager.addUser(ws)
    ws.on('close',()=>gameManager.removeUser(ws))
})