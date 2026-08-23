'use client'
import WaitingPageComponent from "@/components/waitingpage";
import { useSocket } from "@/context/socketProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function WatingPage(){
    const router=useRouter()
    const socket =useSocket()
    useEffect(()=>{
        if(!socket) return
        socket.onmessage=(event)=>{
            const message = JSON.parse(event.data);
            if(message.type=="init_game"){
                if(message.color=="white"){
                    router.push(`/game/play/white/${message.id}`)
                }
                if(message.color=="black"){
                    router.push(`/game/play/black/${message.id}`)
                }
            }
        }
    },[])
    return(
        <div>
            <WaitingPageComponent/>
        </div>
    )
}

