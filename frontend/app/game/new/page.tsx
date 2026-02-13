"use client";

import { useSocket } from "@/hooks/useSocket";
import { Chessboard } from "react-chessboard";
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import type { PieceDropHandlerArgs } from "react-chessboard";
import axios from "axios";
import WinningCard from "@/components/endcomponent";
import ChessClock from "@/components/clock";

export default function Game() {
  const socket = useSocket();
  const [username, setUsername] = useState("");

  const [opponentName, setOpponentName] = useState("");
  const chessRef = useRef(new Chess());
  const [clicked, setclicked] = useState(false);
  const [movehistory, setmovehistory] = useState([]);
  const [winner, setwinner] = useState<string | null>(null);

  async function getusername() {
    try {
      const res = await axios.get(`http://${process.env.NEXT_PUBLIC_IP_ADDRESS}/getuser`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsername(res.data.name);
    } catch (err) {
      console.error(err);
    }
  }
  async function Resignfunction({winnerName,loserName}:{winnerName:string,loserName:string}) {
    socket?.send(
      JSON.stringify({
        type:"end_game",
        winnerName:winnerName,
        loserName:loserName
      })
    )
  }
  const [fen, setFen] = useState(chessRef.current.fen());
  const [color, setColor] = useState<"white" | "black" | null>(null);
  const [started, setStarted] = useState(false);
  const [id, setid] = useState("");

  useEffect(() => {
    getusername();
  }, []);

  useEffect(() => {
    if (!socket || !username) return;

    socket.send(
      JSON.stringify({
        type: "auth",
        username,
      })
    );
  }, [socket, username]);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "init_game") {
          setColor(message.color);
          setStarted(true);
          setid(message.id);
          if (message.opponent) {
            setOpponentName(message.opponent);
          }
        }
        if(message.type=="match_ended"){
          setwinner("Match ended by resignation")
        }
        if (message.type === "opponent_move") {
          chessRef.current.load(message.fen);
          setFen(message.fen);
        }

        if (message.type === "move_history") {
          setmovehistory(message.history);
        }

        if (message.type == "game_over") {

          setwinner(message.result);
        }
        if (message.type === "error") {
          console.error("Server error:", message.message);
          alert("Error: " + message.message);
        }
      } catch (error) {
        console.error("Failed to parse message:", error, "Data:", event.data);
      }
    };
  }, [socket]);

  function startGame() {
    setclicked(true);
    socket?.send(JSON.stringify({ type: "init_game" }));
    setwinner(null);
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
      <div className="flex justify-center items-center h-screen text-white bg-gradient-to-br from-black via-zinc-900 to-black">
        Connecting to server...
      </div>
    );
  }

  if (winner != null) {
    return <WinningCard winner={winner} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black via-zinc-900 to-black text-white px-4">
      
      {!started ? (
        <div className="bg-zinc-900/80 backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-zinc-700 text-center">
          <h1 className="text-3xl font-bold mb-6">
            Welcome, <span className="text-emerald-400">{username}</span>
          </h1>

          <button
            onClick={startGame}
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 transition rounded-lg font-semibold text-black shadow-lg"
          >
            {clicked ? "Searching for players..." : "Start Game"}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-[95vw] h-[90vh] bg-zinc-900/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-zinc-700 flex flex-col">
          
          {/* Game info */}
          <div className="mb-6 text-center">
            <div className="text-sm text-zinc-400">Game ID</div>
            <div className="font-mono text-emerald-400">{id}</div>

            <div className="mt-2 text-sm text-zinc-400">Opponent</div>
            <div className="font-semibold">
              {opponentName || "Unknown player"}
            </div>
            
          </div>
          <div>
            <ChessClock format="blitz" shouldStart={false}/>
          </div>
          {/* Board + Sidebar */}
          <div className="flex justify-center items-start gap-10 flex-1">
            
            {/* Chessboard */}
            <div className="w-[600px] shadow-2xl rounded-xl overflow-hidden">
              
              <Chessboard
                options={{
                  position: fen,
                  onPieceDrop: onDrop,
                  boardOrientation: color ?? "white",
                  id: "multiplayer-board",
                }}
              />
              
            </div>
              <div>
                <ChessClock format="blitz" shouldStart={false}/>
              </div>
            {/* Moves Sidebar */}
            
            <div className="bg-zinc-900 flex-1 max-w-4xl rounded-xl shadow-xl flex flex-col border border-zinc-700">
              <button className="bg-red-600 h-10 w-fit rounded-lg px-10 py-2 mx-15 my-5"
               onClick={()=>Resignfunction({winnerName:"parashar",loserName:"paritosh"})}>
                Resign</button>
              <div className="p-4 border-b border-zinc-700 bg-zinc-800">
                <h1 className="text-lg font-semibold tracking-wide">
                  Move History
                </h1>
              </div>

              <ul className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
                {movehistory.length === 0 ? (
                  <p className="text-zinc-500 text-center mt-6">
                    No moves yet
                  </p>
                ) : (
                  movehistory.map((move, index) => (
                    <li
                      key={index}
                      className="flex justify-between px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 transition"
                    >
                      <span className="text-zinc-400">
                        {index + 1}.
                      </span>
                      <span className="font-medium">{move}</span>
                    </li>
                  ))
                )}
              </ul>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
