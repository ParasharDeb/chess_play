"use client";

import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useEffect, useState } from "react";

export default function ChessLandingPage() {
  const [hasToken, setHasToken] = useState(false);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setHasToken(!!token);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  const features = [
    { icon: "♔", title: "Strategic Gameplay", description: "LMAO the art of chess with advanced AI opponents and tactical training" },
    { icon: "⚡", title: "Lightning Fast", description: "Instant matchmaking with players worldwide. No lag, just pure strategy" },
    { icon: "📊", title: "Deep Analytics", description: "Track your progress with detailed statistics and game analysis" },
    { icon: "🏆", title: "Tournaments", description: "Compete in daily tournaments and climb the global leaderboard" },
  ];

  const stats = [
    { number: "100K+", label: "Active Players" },
    { number: "5M+", label: "Games Played" },
    { number: "150+", label: "Countries" },
    { number: "24/7", label: "Always Online" },
  ];

  return (
    <div className="bg-black text-white overflow-hidden">

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">

        {/* Grid BG */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        {/* Floating Pieces */}
        {["♜", "♞", "♝"].map((p, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl opacity-5"
            style={{
              top: i === 0 ? "20%" : i === 2 ? "30%" : "auto",
              bottom: i === 1 ? "20%" : "auto",
              left: i === 0 ? "10%" : "auto",
              right: i !== 0 ? "10%" : "auto",
            }}
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 8 + i, repeat: Infinity }}
          >
            {p}
          </motion.div>
        ))}

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl text-center"
          style={{ y, opacity }}
        >
          <motion.div variants={itemVariants} className="mb-6 inline-block">
            <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm uppercase">
              The Ultimate Chess Experience
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-bold mb-6 leading-none"
            style={{ fontFamily: "Playfair Display" }}
          >
            Master the <br /> Art of Chess
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            Challenge players worldwide, analyze games with AI, and climb the ranks.
          </motion.p>

          <motion.div variants={itemVariants} className="flex gap-4 justify-center">
            <a
              href={hasToken ? "/game/new" : "/signup"}
              className="px-8 py-4 bg-white text-black font-semibold rounded-lg"
            >
              {hasToken ? "Start Playing" : "Start Free"}
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="py-20 border-y border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-5xl font-bold">{s.number}</div>
              <div className="text-gray-400">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 bg-white/5 border border-white/10 rounded-xl"
            >
              <div className="text-5xl mb-3">{f.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <h2 className="text-5xl font-bold mb-6">Ready to Play?</h2>
        <a
          href={hasToken ? "/game/new" : "/signup"}
          className="px-12 py-5 bg-white text-black font-bold rounded-lg"
        >
          Get Started
        </a>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8 text-center text-gray-400">
        © 2026 Chess Masters
      </footer>

      {/* Fonts */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;600&display=swap");
      `}</style>
    </div>
  );
}
