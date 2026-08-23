'use client'
import { useSocket, useSocketMessage } from "@/context/socketProvider";
import { useRouter } from "next/navigation"
import { Chessboard } from "react-chessboard";
import { useState } from "react";

/* ─────────────────────────── styles ─────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg:        #0a0a0a;
    --surface:   #111111;
    --surface2:  #161616;
    --border:    rgba(255,255,255,0.07);
    --border-h:  rgba(255,255,255,0.14);
    --accent:    #ffffff;
    --muted:     rgba(255,255,255,0.35);
    --muted2:    rgba(255,255,255,0.55);
    --grid-line: rgba(255,255,255,0.035);
    --nav-w:     72px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ═══════════════════════════════════════
     HERO
  ═══════════════════════════════════════ */
  .gl-hero {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
    gap: 56px;
  }

  /* board col */
  .gl-board-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }

  .gl-board-frame {
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 0 80px rgba(0,0,0,0.9), 0 0 0 1px var(--border);
    width: clamp(280px, 38vw, 480px);
  }

  .gl-board-caption {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-align: center;
  }

  /* right col */
  .gl-right-col {
    display: flex;
    flex-direction: column;
    gap: 32px;
    max-width: 360px;
    width: 100%;
    animation: fade-up 0.6s 0.1s cubic-bezier(0.22,1,0.36,1) both;
  }

  .gl-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 5px 14px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    width: fit-content;
  }

  .gl-headline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 4vw, 50px);
    font-weight: 900;
    line-height: 1.06;
    letter-spacing: -0.02em;
  }

  .gl-headline em {
    font-style: italic;
    color: var(--muted2);
  }

  .gl-sub {
    font-size: 14px;
    color: var(--muted);
    line-height: 1.65;
    font-weight: 300;
  }

  /* time controls */
  .gl-time-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .gl-time-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .gl-time-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .gl-time-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
    color: var(--accent);
    gap: 3px;
  }

  .gl-time-btn:hover {
    background: var(--surface2);
    border-color: var(--border-h);
    transform: translateY(-1px);
  }

  .gl-time-btn.selected {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.3);
  }

  .gl-time-main {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
  }

  .gl-time-sub {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .gl-time-btn.selected .gl-time-sub {
    color: var(--muted2);
  }

  /* start button */
  .gl-start-btn {
    width: 100%;
    padding: 16px 24px;
    background: var(--accent);
    color: var(--bg);
    border: none;
    border-radius: 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .gl-start-btn:hover {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  .gl-start-btn:active {
    transform: translateY(0);
    opacity: 0.75;
  }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 860px) {
    .gl-hero {
      flex-direction: column;
      padding: 32px 24px;
      gap: 36px;
    }
    .gl-right-col { max-width: 100%; }
    .gl-board-frame { width: 100%; }
  }
`;

const TIME_CONTROLS = [
  { label: "1+0",  sub: "Bullet",     value: "1|0"  },
  { label: "1+1",  sub: "Bullet",     value: "1|1"  },
  { label: "5+0",  sub: "Blitz",      value: "5|0"  },
  { label: "5+5",  sub: "Blitz",      value: "5|5"  },
  { label: "10+0", sub: "Rapid",      value: "10|0" },
  { label: "15+10",sub: "Rapid",      value: "15|10"},
];

export default function GameLandingPage() {
  const router = useRouter();
  const socket = useSocket();
  const [selectedTime, setSelectedTime] = useState("10|0");

  useSocketMessage("init_game", (message) => {
    console.log("Game started:", message);
    router.push(`/game/play/${message.color}/${message.id}`);
  });

  function clickhandler() {
    socket?.send(JSON.stringify({ type: "init_game" }));
    router.push("/waiting");
  }

  return (
    <>
      <style>{styles}</style>

      {/* top bar */}
      <div className="gl-topbar">
        <div className="gl-topbar-pill">
          <span className="gl-topbar-dot" />
          Play Chess
        </div>
        <div className="gl-topbar-right">12,481 players online</div>
      </div>

      {/* hero */}
      <div className="gl-hero">

        {/* chessboard */}
        <div className="gl-board-col">
          <div className="gl-board-frame">
            <Chessboard />
          </div>
          <p className="gl-board-caption">Preview · Standard setup</p>
        </div>

        {/* right panel */}
        <div className="gl-right-col">
          <span className="gl-eyebrow">New Game</span>

          <h1 className="gl-headline">
            Choose your<br /><em>time control</em>
          </h1>

          <p className="gl-sub">
            Select a format below and press Start. We'll match you with an opponent in seconds.
          </p>

          {/* time controls */}
          <div className="gl-time-section">
            <p className="gl-time-label">Time Control</p>
            <div className="gl-time-grid">
              {TIME_CONTROLS.map((tc) => (
                <button
                  key={tc.value}
                  className={`gl-time-btn${selectedTime === tc.value ? ' selected' : ''}`}
                  onClick={() => setSelectedTime(tc.value)}
                >
                  <span className="gl-time-main">{tc.label}</span>
                  <span className="gl-time-sub">{tc.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* start */}
          <button className="gl-start-btn" onClick={clickhandler}>
            Start Playing · {selectedTime}
          </button>
        </div>

      </div>
    </>
  );
}