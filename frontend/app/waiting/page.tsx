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
                    router.push(`/play/white/${message.id}`)
                }
                if(message.color=="black"){
                    router.push(`/play/black/${message.id}`)
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

// type: 'init_game', color: 'white', id: 'd7462673-1995-43ab-9f1e-5e2b6a9c8803', you: 'player1Name', opponent: 'player2Name', …}
// color
// : 
// "white"
// id
// : 
// "d7462673-1995-43ab-9f1e-5e2b6a9c8803"
// opponent
// : 
// "player2Name"
// opponentRating
// : 
// 1700
// type
// : 
// "init_game"
// you
// : 
// "player1Name"
// youRating:1600