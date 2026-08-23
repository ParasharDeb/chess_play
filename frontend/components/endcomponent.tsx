import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Props = {
  winner: string | null
  rating: number
  ratingChange: number // positive for win, negative for loss
}

export default function WinningCard({ winner, rating, ratingChange }: Props) {
  const router = useRouter()

  const [displayRating, setDisplayRating] = useState(rating)
  const [animDone, setAnimDone] = useState(false)

  const isWin = ratingChange > 0

  // Animate rating change
  useEffect(() => {
    let current = rating
    const target = rating + ratingChange
    const step = ratingChange > 0 ? 1 : -1

    const interval = setInterval(() => {
      current += step
      setDisplayRating(current)

      if (current === target) {
        clearInterval(interval)
        setAnimDone(true)
      }
    }, 40)

    return () => clearInterval(interval)
  }, [rating, ratingChange])

  function startGame() {
    router.push("/game/new")
  }

  const resultText = isWin ? "You Won 🎉" : "You Lost 😢"
  const ratingColor = isWin ? "text-green-400" : "text-red-400"

  return (
    <div className="flex w-screen h-screen justify-center items-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-xl text-center space-y-6">

        {/* Winner Text */}
        <h1 className="text-4xl font-bold">
          {winner ?? resultText}
        </h1>

        {/* Rating Display */}
        <div className="text-2xl">
          <p>Your Rating</p>
          <p className={`text-5xl font-bold transition-all ${ratingColor}`}>
            {displayRating}
          </p>

          {animDone && (
            <p className={ratingColor}>
              {ratingChange > 0 ? "+" : ""}
              {ratingChange}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button className="bg-white text-black px-6 py-3 rounded-xl hover:scale-105 transition">
            Analyse
          </button>

          <button
            onClick={startGame}
            className="bg-green-500 px-6 py-3 rounded-xl hover:scale-105 transition"
          >
            New Game
          </button>
        </div>

      </div>
    </div>
  )
}
