"use client";

import { useSocket } from "@/hooks/useSocket";
import { Chessboard } from "react-chessboard";
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { useRouter } from "next/navigation";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { motion } from "framer-motion";

export default function Game() {
  const socket = useSocket();
  const router=useRouter()
  const chessRef = useRef(new Chess());
  const [clicked, setclicked] = useState(false);
  const [fen, setFen] = useState(chessRef.current.fen());
  const [color, setColor] = useState<"white" | "black" | null>(null);
  const [started, setStarted] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  // listen for messages
  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "init_game") {
        setColor(message.color);
        setStarted(true);
      }

      if (message.type === "opponent_move") {
        chessRef.current.load(message.fen);
        setFen(message.fen);
        const history = chessRef.current.history();
        setMoveHistory(history);
      }
      if(message.type=="game_over"){
        router.push("/game/end")
      }
    };
  }, [socket]);

  function startGame() {
    socket?.send(JSON.stringify({ type: "init_game" }));
    setclicked(true);
  }

  function onDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!started || !targetSquare) return false;

    socket?.send(
      JSON.stringify({
        type: "move",
        move: {
          from: sourceSquare,
          to: targetSquare,
        },
      })
    );
    try {
      const result = chessRef.current.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (!result) return false;

      setFen(chessRef.current.fen());
      const history = chessRef.current.history();
      setMoveHistory(history);
      return true;
    } catch {
      return false;
    }
  }

  if (!socket) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            className="text-8xl mb-6"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            ⚠️
          </motion.div>
          <h2
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Connection Lost
          </h2>
          <p className="text-gray-400 text-lg">Sorry Backend is down</p>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-black via-gray-900 to-black gap-6 p-4 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        ></div>
      </div>

      {/* Decorative Chess Pieces */}
      <motion.div
        className="absolute top-10 left-10 text-6xl opacity-5 pointer-events-none"
        animate={{
          y: [0, -30, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        ♜
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-10 text-7xl opacity-5 pointer-events-none"
        animate={{
          y: [0, 30, 0],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        ♞
      </motion.div>

      {!started ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 relative z-10"
        >
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <motion.div
              className="text-7xl mb-4"
              animate={{
                rotate: [0, -10, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              ♟️
            </motion.div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {clicked ? "Finding Opponent" : "Ready to Play?"}
            </h1>
            <p className="text-gray-400 text-lg">
              {clicked
                ? "Please wait while we match you with a player"
                : "Start a new game and challenge players worldwide"}
            </p>
          </motion.div>

          {/* Button Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl"
          >
            <button
              onClick={startGame}
              className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {!clicked && <button onClick={startGame}>start-game</button>}
              {clicked && <button>Waiting for player...</button>}
            </button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full h-full flex items-center justify-center relative z-10 px-4"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full max-w-[95vw] h-[90vh]">
            {/* Chess Board - 60% width */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-[0.6] flex flex-col justify-center"
            >
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6 shadow-2xl max-h-screen">
                <div className="h-215 w-215">
                  <Chessboard 
                    options={{
                      position: fen,
                      onPieceDrop: onDrop,
                      boardOrientation: color ?? "white",
                      id: "multiplayer-board",
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Move History Panel - 40% width */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-[0.4] h-full flex flex-col"
            >
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
                <h3
                  className="text-2xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Move History
                </h3>
                
                {/* Moves List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {moveHistory.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8">
                      <p className="text-4xl mb-3">♟️</p>
                      <p>No moves yet</p>
                      <p className="text-sm mt-2">Make your first move!</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {moveHistory.map((move, index) => {
                        const moveNumber = Math.floor(index / 2) + 1;
                        const isWhiteMove = index % 2 === 0;
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              index === moveHistory.length - 1
                                ? "bg-white/20 border border-white/30"
                                : "bg-white/5 hover:bg-white/10"
                            } transition-colors`}
                          >
                            {isWhiteMove && (
                              <span className="text-gray-400 font-semibold min-w-[40px]">
                                {moveNumber}.
                              </span>
                            )}
                            {!isWhiteMove && (
                              <span className="text-transparent min-w-[40px]">
                                {moveNumber}.
                              </span>
                            )}
                            <span className="text-white font-mono font-bold text-lg">
                              {move}
                            </span>
                            <span className="ml-auto text-2xl">
                              {isWhiteMove ? "♚" : "♔"}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Stats Footer */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-gray-400 text-sm">Total Moves</p>
                      <p className="text-white text-2xl font-bold">
                        {moveHistory.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Current Turn</p>
                      <p className="text-white text-2xl">
                        {moveHistory.length % 2 === 0 ? "♔" : "♚"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Font Import */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}