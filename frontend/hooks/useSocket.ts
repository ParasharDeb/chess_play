
import { useEffect, useState } from "react"

export const useSocket=()=>{
    const [socket,setsocket]=useState<WebSocket|null>(null)
    useEffect(()=>{
        const ws = new WebSocket("ws://localhost:8080")
        ws.onopen=()=>{
            setsocket(ws)
        }
        ws.onclose=()=>{
            setsocket(null)
        }
        return()=>{
            ws.close()
        }
    },[])
    return socket
}  