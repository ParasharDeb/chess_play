import { useState } from "react"
import { useRouter } from "next/navigation"
export default function WinningCard({winner}:{winner:string|null}){
    const buttonStyles="w-fit h-fit bg-white rounded-xl px-10 py-5 text-black mx-10 cursor-pointer"
    const router=useRouter()
    const [clicked,setclicked]=useState(false)
    function startGame() {
    router.push("/")

    }
    return(
        <div className="flex w-screen h-screen justify-center items-center">
            <div>
            <h1 className="">
                {winner}
            </h1>
            <button className={buttonStyles}>
                Analyse
            </button>
            <button className={buttonStyles} onClick={startGame}>
                {clicked?"connecting":"newgame"}
            </button>
            </div>
        </div>
    )
}