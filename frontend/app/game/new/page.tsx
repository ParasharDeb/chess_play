"use client";

import { useSocket } from "@/hooks/useSocket";
import { Chessboard } from "react-chessboard";
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { motion } from "framer-motion";

export default function Game() {
  const socket = useSocket();
  const chessRef = useRef(new Chess());
  const [clicked, setclicked] = useState(false);
  const [fen, setFen] = useState(chessRef.current.fen());
  const [color, setColor] = useState<"white" | "black" | null>(null);
  const [started, setStarted] = useState(false);

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
          className="w-full max-w-3xl relative z-10"
        >
          {/* Game Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Game in Progress
            </h2>
            <p className="text-gray-400">
              You are playing as{" "}
              <span className="text-white font-semibold">
                {color === "white" ? "White ♔" : "Black ♚"}
              </span>
            </p>
          </motion.div>

          {/* Chess Board Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6 shadow-2xl"
          >
            <div className="h-100 w-100">
              <Chessboard 
        
          options={{
            position: fen,
            onPieceDrop: onDrop,
            boardOrientation: color ?? "white",
            id: "multiplayer-board",
          }}
        />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Font Import */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
      `}</style>
    </div>
  );
}