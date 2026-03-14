'use client'
import { useSocket, useSocketMessage } from "@/context/socketProvider";
import { useRouter } from "next/navigation"


export default function GameLandingPage(){
    
    const router = useRouter()
    const socket = useSocket();

    useSocketMessage("init_game", (message) => {
        console.log("Game started:", message);
        // Redirect player to the play page with their color and room ID
        router.push(`/game/play/${message.color}/${message.id}`);
    });

    function clickhandler(){
        socket?.send(JSON.stringify({
            type:"init_game"
        }))
        router.push("/waiting")
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