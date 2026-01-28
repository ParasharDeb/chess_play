"use client";

import { useSocket } from "@/hooks/useSocket";
import { Chessboard } from "react-chessboard";
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import type { PieceDropHandlerArgs } from "react-chessboard";

export default function Game() {
  const socket = useSocket();
  const chessRef = useRef(new Chess());

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
      <div className="flex justify-center items-center h-screen text-white">
        Connecting to server...
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-black gap-6">
      {!started ? (
        <button
          onClick={startGame}
          className="px-6 py-3 bg-white text-black rounded-lg font-semibold"
        >
          Start Game
        </button>
      ) : (
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
      )}
    </div>
  );
}
