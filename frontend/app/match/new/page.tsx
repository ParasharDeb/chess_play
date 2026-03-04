"use client";

import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function MatchLobby() {
  const socket = useSocket();
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [clicked, setClicked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getUsername() {
    try {
      const base =
        process.env.NEXT_PUBLIC_API_URL ||
        `http://${process.env.NEXT_PUBLIC_IP_ADDRESS}` ||
        "";
      const res = await axios.get(`${base}/getuser`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsername(res.data.name);
    } catch (err) {
      console.error(err);
      setError("Failed to get user info");
    }
  }

  useEffect(() => {
    getUsername();
  }, []);

  useEffect(() => {
    if (!socket || !username) return;

    socket.send(JSON.stringify({ type: "auth", username }));

    // Listen for game initialization
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "init_game") {
          // Store game initialization data in localStorage
          localStorage.setItem(
            "gameInit",
            JSON.stringify({
              id: message.id,
              color: message.color,
              opponent: message.opponent,
              youRating: message.youRating,
              opponentRating: message.opponentRating,
            })
          );
          // Redirect to the game room
          router.push(`/match/new/${message.id}`);
        }

        if (message.type === "error") {
          console.error("Server error:", message.message);
          setError(message.message);
          setClicked(false);
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };
  }, [socket, username, router]);

  function startGame() {
    setClicked(true);
    setError(null);
    socket?.send(JSON.stringify({ type: "init_game" }));
  }

  if (!socket) {
    return (
      <div className="flex justify-center items-center h-screen text-white bg-gradient-to-br from-black via-zinc-900 to-black">
        Connecting to server...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black via-zinc-900 to-black text-white px-4">
      <div className="bg-zinc-900/80 backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-zinc-700 text-center max-w-md">
        <h1 className="text-4xl font-bold mb-8">
          Welcome, <span className="text-emerald-400">{username || "Player"}</span>
        </h1>

        <p className="text-zinc-300 mb-8">
          Ready to play? Click the button below to find an opponent and start your match.
        </p>

        <button
          onClick={startGame}
          disabled={clicked}
          className="w-full px-8 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-600 disabled:cursor-not-allowed transition rounded-lg font-semibold text-black shadow-lg text-lg"
        >
          {clicked ? "Searching for players..." : "Start Game"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
