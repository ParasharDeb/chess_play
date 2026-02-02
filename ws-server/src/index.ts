import mongoose from 'mongoose';
import { WebSocketServer } from 'ws';
import {connectDB, UserModel} from "@repo/database"
import { GameManager } from './gamemanager';
const wss = new WebSocketServer({ port: 8080 });
const manager = new GameManager();
connectDB()
wss.on('connection', async function connection(ws) {
    const user = await UserModel.create({
        email:Math.random().toString(),
        password:Math.random().toString(),
        name:Math.random().toString()
    })
    console.log(user)
    console.log("6 - connected");
    manager.addUser(ws);
    ws.on('close', () => manager.removeUser(ws));
});