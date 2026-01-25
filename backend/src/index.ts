
import { WebSocketServer } from 'ws';
import { GameManager } from './gamemanager';

const wss = new WebSocketServer({ port: 8080 });
const manager = new GameManager();

wss.on('connection',async function connection(ws) {

    manager.addUser(ws);
    ws.on('close', () => manager.removeUser(ws));
});
