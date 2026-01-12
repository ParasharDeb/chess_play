import { useEffect, useState } from "react"
const WS_URL="ws://localhost:8080"
export const usesocket=()=>{
    const [socket,setsocket]=useState<WebSocket|null>(null)
    useEffect(()=>{
        const ws = new WebSocket(WS_URL);
        ws.onopen=()=>{
            setsocket(ws)
        }
        ws.onclose=()=>{
            setsocket(null)
        }
        return ()=>{
            ws.close();
        }
    },[])
    return socket
}