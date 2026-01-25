"use client"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react";
import { INIT_GAME } from "../constants";
import { ECDH } from "crypto";
export default function Startgame(){
    const router= useRouter();
    const socketref = useRef<WebSocket|null>(null)
    const [messages,setmessages]=useState<string>()
    useEffect(()=>{
        const websocket= new WebSocket('ws://localhost:8080');
        socketref.current=websocket;
        websocket.onmessage=(event)=>{
            const message= JSON.parse(event.data)
            console.log(message)
            const color = message.payload.color 
            
            if(color=="black"){
                router.push("/game/black/123")
            }
            else router.push("/game/white/123")
        }
    },[])
    function StartgameLogic(){
        console.log("clicked")
        socketref.current?.send(
            JSON.stringify({
                "type":INIT_GAME
            })
        )
        
    }
    
    return(
        <div className="flex w-screen h-screen items-center justify-center">
            <button className="bg-green-500 px-10 py-5 cursor-pointer" onClick={StartgameLogic}>New Game</button>
        </div>
    )
}