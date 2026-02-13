"use client"
import React from "react"

export default function ChessClock({
    format,
    timeSeconds,
    running
}:{
    format:"blitz"|"rapid"|"bullet",
    timeSeconds:number,
    running?:boolean
}){

    const minutes = Math.floor(timeSeconds / 60);
    const seconds = timeSeconds % 60;

    return(
        <div className={`bg-white text-black flex items-center justify-center w-fit rounded-md px-7 py-2 text-lg ${running?"ring-2 ring-emerald-400":""}`}>
            {minutes}:{seconds.toString().padStart(2,"0")}
        </div>
    )
}
