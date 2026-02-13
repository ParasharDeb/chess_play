"use client"
import { useEffect, useState } from "react"

export default function ChessClock({
    format,
    shouldStart
}:{
    format:"blitz"|"rapid"|"bullet",
    shouldStart:boolean
}){

    const [seconds,setSeconds]=useState(59)
    const [minutes,setminutes]=useState(0)

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

    useEffect(() => {
        if (!shouldStart) return;

        const interval = setInterval(() => {
            setSeconds(prev => {
                if (prev === 0) {
                    setminutes(m => {
                        if (m === 0) return 0;
                        return m - 1;
                    });
                    return 59;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [shouldStart]);

    return(
        <div className="bg-white text-black flex items-center justify-center w-fit rounded-md px-7 py-2 text-lg">
            {minutes}:{seconds.toString().padStart(2,"0")}
        </div>
    )
}
