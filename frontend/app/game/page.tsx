'use client'
import { useSocket } from "@/context/socketProvider";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";
export default function GameLandingPage(){
    const [roomID,setroomID]=useState("")
    const router=useRouter()
    const socket = useSocket();
    useEffect(()=>{
        if(!socket) return
        socket.onmessage=(event)=>{
            const message = JSON.parse(event.data);
            if(message.type=="init_game"){
                console.log(message)
            }
        }
    },[])
    function clickhandler(){
        router.push("/waiting")
        socket?.send(JSON.stringify({
            type:"init_game"
        }))
        
    }
    return(
        <div className="w-scren h-screen flex items-center justify-center">
            <div className="bg-green-700 p-5 rounded-lg">
            <button onClick={clickhandler}>
                Start the game
            </button>
            </div>
        </div>
    )
}