"use client"
import { useEffect, useState } from "react"

export default function ChessClock(
    {format,shouldStart}:{
        format:"blitz"|"rapid"|"bullet",
        shouldStart:boolean
    }){
        const [seconds,setSeconds]=useState<number>(59)
        const [minutes,setminutes]=useState<number>(0)
        useEffect(()=>{
        if(format=="bullet"){
            setSeconds(59)
            setminutes(0)
        }
        else if(format=="blitz"){
            setSeconds(59)
            setminutes(4)
        }
        else if(format=="rapid"){
            setSeconds(59)
            setminutes(10)
        }
        },[format])
        if(shouldStart){
            setInterval(() => {
                setSeconds(seconds=>seconds-1)
            }, 1000);
            if(seconds<0){
                setSeconds(59)
                setminutes(minutes=>minutes-1)
            }
            if(minutes==0 && seconds==0){
                setminutes(5)
                setSeconds(49)
            }
        }
        return(
            <div className="bg-white text-black flex items-center justify-center w-fit rounded-md px-7 py-2 text-lg">
                {minutes}:{seconds}
            </div>
        )
}