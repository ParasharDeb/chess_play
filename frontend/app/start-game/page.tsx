"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWSStore } from "@/store/wsStore";

export default function StartGame() {
  const initGame = useWSStore((s) => s.initGame);
  const status = useWSStore((s) => s.status);
  const color = useWSStore((s) => s.color);
  const roomId = useWSStore((s) => s.roomId);

  const router = useRouter();

  useEffect(() => {
    if (status === "waiting") router.push("/waiting");
    if (status === "playing" && color && roomId) {
      router.push(`/game/${color}/${roomId}`);
    }
  }, [status, color, roomId]);

  return (
    <div className="h-screen flex items-center justify-center">
      <button onClick={initGame} className="px-8 py-4 bg-white text-black rounded-xl">
        Start Game
      </button>
    </div>
  );
}
