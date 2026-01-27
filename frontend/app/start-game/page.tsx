'use client'
import { useSocket } from "@/hooks/useSocket"
import WaitingPage from "@/components/waitingpage";
import { INIT_GAME } from "../constants";
import { Chessboard } from "react-chessboard";

export default function Game(){
    const socket = useSocket();
    if(!socket) return  WaitingPage
    const StartGame=()=>{
        socket.send(JSON.stringify({
            "type":INIT_GAME
        }))
    }
    return(
        <div className="flex items-center justify-center h-screen w-screen gap-10">
            <div className="w-200 h-200">
                <Chessboard/>
            </div>
            <button className="bg-white text-black rounded-full cursor-pointer px-8 py-4" onClick={StartGame}>
                Play
            </button>
        </div>
    )
}