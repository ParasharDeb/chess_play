'use client'
import { useSocket } from "@/hooks/useSocket"
import WaitingPage from "@/components/waitingpage";
import { INIT_GAME } from "../constants";

export default function Game(){
    const socket = useSocket();
    if(!socket) return  WaitingPage
    const StartGame=()=>{
        socket.send(JSON.stringify({
            "type":INIT_GAME
        }))
    }
    return(
        <div className="flex items-center justify-center h-screen w-screen">
            <button className="bg-white text-black rounded-full cursor-pointer px-8 py-4" onClick={StartGame}>
                Play
            </button>
        </div>
    )
}