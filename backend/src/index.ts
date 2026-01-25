import { prisma } from "@repo/db"
import { WebSocketServer } from 'ws';
import { GameManager } from './gamemanager';

const wss = new WebSocketServer({ port: 8080 });
const manager = new GameManager();

wss.on('connection',async function connection(ws) {
    const user = await prisma.user.create({
        data:{
            email:Math.random().toString(),
            name:Math.random().toString()
        }
    })
    console.log(user)
    manager.addUser(ws);
    ws.on('close', () => manager.removeUser(ws));
});
