'use client'

import { useEffect, useState } from "react"

export const useSocket=()=>{
    const [socket,setsocket]=useState<WebSocket|null>(null)
 
    useEffect(()=>{
        const ws = new WebSocket(`ws://${process.env.NEXT_PUBLIC_WS_ADDRESS}:8080`)
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