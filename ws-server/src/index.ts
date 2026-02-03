import mongoose from 'mongoose';
import { WebSocketServer } from 'ws';
import {connectDB, UserModel} from "@repo/database"
import { GameManager } from './gamemanager';
const wss = new WebSocketServer({ port: 8080 });
const manager = new GameManager();
connectDB()
wss.on('connection', async function connection(ws) {
    manager.addUser(ws);
    ws.on('close', () => manager.removeUser(ws));
});