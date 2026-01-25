"use client"
import { useRouter } from "next/navigation"
export default function Startgame(){
    const router= useRouter();
    return(
        <div className="flex w-screen h-screen items-center justify-center">
            <button className="bg-green-500 px-10 py-5" onClick={()=>{router.push("/game/black/123")}}>New Game</button>
        </div>
    )
}