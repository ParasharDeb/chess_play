"use client";

import { useSocket } from "@/hooks/useSocket";
import { Chessboard } from "react-chessboard";
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import type { PieceDropHandlerArgs } from "react-chessboard";
import axios from "axios";
export default  function  Game() {
  const socket = useSocket();
  const [username, setUsername] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const chessRef = useRef(new Chess());
  async function getusername() {
    try {
      const res = await axios.get("http://localhost:3030/getuser", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      setUsername(res.data.name);
    } catch (err) {
      console.error(err);
    }
  }
  const [fen, setFen] = useState(chessRef.current.fen());
  const [color, setColor] = useState<"white" | "black" | null>(null);
  const [started, setStarted] = useState(false);
  const [id,setid]=useState("")
  // listen for messages
  useEffect(()=>{
    getusername()
  },[])

  // Send our username to the websocket server so it can share it with the opponent
  useEffect(() => {
    if (!socket || !username) return;

    socket.send(JSON.stringify({
      type: "auth",
      username
    }));
  }, [socket, username]);

  useEffect(() => {
    if (!socket) return;
   
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === "init_game") {
        setColor(message.color);
        setStarted(true);
        setid(message.id)
        if (message.opponent) {
          setOpponentName(message.opponent);
        }
        
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
        <div>
        <h1>Hello {username}</h1>
        <button
          onClick={startGame}
          className="px-6 py-3 bg-white text-black rounded-lg font-semibold"
        >
          Start Game
        </button>
        </div>
      ) : (
        <div className="h-100 w-100">
          <div className="mb-2 text-white">
            <div>Game ID: {id}</div>
            <div>Opponent: {opponentName || "Unknown player"}</div>
          </div>
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