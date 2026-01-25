'use client'
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ChessLoader() {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-6">
        {/* Chess board animation */}
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-10 h-10 rounded-lg ${i % 2 === 0 ? "bg-zinc-800" : "bg-zinc-700"}`}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.08,
              }}
            />
          ))}
        </div>

        {/* Text */}
        <motion.h1
          className="text-xl font-semibold tracking-wide"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          Finding worthy opponent{".".repeat(dots)}
        </motion.h1>

        {/* Subtle status */}
        <p className="text-sm text-zinc-400">Real-time matchmaking in progress</p>
      </div>
    </div>
  );
}
