"use client"
import { useRouter } from "next/navigation"
import { INIT_GAME, WAITING } from "../constants";
import {useWSStore} from "@/store/wsStore"
export default function Startgame(){
    const router= useRouter();
    const sendMessage=useWSStore((s)=>s.sendMessage)
    function StartgameLogic(){
        sendMessage({
            type:INIT_GAME
        })
        console.log("reached")
    }
    return(
        <div className="flex w-screen h-screen items-center justify-center">
            <button className="bg-green-500 px-10 py-5 cursor-pointer" onClick={StartgameLogic}>New Game</button>
        </div>
    )
}