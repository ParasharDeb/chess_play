'use client'
import WaitingPageComponent from "@/components/waitingpage";
import { useSocket } from "@/context/socketProvider";
import { useEffect } from "react";

export default function WatingPage(){
    const socket =useSocket()
    useEffect(()=>{
        if(!socket) return
        socket.onmessage=(event)=>{
            const message = JSON.parse(event.data);
            if(message.type=="init_game"){
                
            }
        }
    },[])
    return(
        <div>
            <WaitingPageComponent/>
        </div>
    )
}