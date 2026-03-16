'use client'
import { useRouter } from "next/navigation";

/* ─────────────────────────── types ─────────────────────────── */
type Result = "win" | "loss" | "draw";

interface GameEndPageProps {
  result?: Result;
  reason?: string;         // e.g. "Checkmate", "Resignation", "Timeout", "Stalemate"
  playerName?: string;
  opponentName?: string;
  playerElo?: number;
  opponentElo?: number;
  eloDelta?: number;       // + or - change
  moves?: number;
  duration?: string;       // e.g. "4:32"
  pgn?: string;
}

/* ─────────────────────────── styles ─────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg:         #0a0a0a;
    --surface:    #111111;
    --surface2:   #161616;
    --border:     rgba(255,255,255,0.07);
    --border-h:   rgba(255,255,255,0.14);
    --accent:     #ffffff;
    --muted:      rgba(255,255,255,0.35);
    --muted2:     rgba(255,255,255,0.55);
    --grid-line:  rgba(255,255,255,0.035);
    --win:        #4ade80;
    --loss:       #f87171;
    --draw:       #facc15;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ge-root {
    min-height: 100vh;
    background-color: var(--bg);
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 60px 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    color: var(--accent);
    padding: 48px 24px;
    position: relative;
    overflow: hidden;
  }

  /* watermarks */
  .ge-wm {
    position: fixed;
    pointer-events: none;
    font-size: 220px;
    line-height: 1;
    opacity: 0.025;
    user-select: none;
    z-index: 0;
  }
  .ge-wm-tl { top: -20px; left: -20px; }
  .ge-wm-br { bottom: -20px; right: -20px; }

  /* ── main card ── */
  .ge-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 520px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
    animation: card-in 0.65s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes card-in {
    from { opacity: 0; transform: translateY(28px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)   scale(1);     }
  }

  /* ── result banner ── */
  .ge-banner {
    padding: 36px 40px 28px;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    position: relative;
    overflow: hidden;
  }

  /* radial glow behind banner */
  .ge-banner::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, var(--result-color, transparent) 0%, transparent 70%);
    opacity: 0.07;
    pointer-events: none;
  }

  .ge-banner[data-result="win"]  { --result-color: var(--win);  }
  .ge-banner[data-result="loss"] { --result-color: var(--loss); }
  .ge-banner[data-result="draw"] { --result-color: var(--draw); }

  .ge-result-icon {
    font-size: 52px;
    line-height: 1;
    animation: icon-drop 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  @keyframes icon-drop {
    from { opacity: 0; transform: translateY(-16px) scale(0.7); }
    to   { opacity: 1; transform: translateY(0)     scale(1);   }
  }

  .ge-result-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 14px;
    border-radius: 999px;
    border: 1px solid;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    animation: fade-in 0.4s 0.3s both;
  }

  .ge-result-pill[data-result="win"]  { color: var(--win);  border-color: rgba(74,222,128,0.3);  background: rgba(74,222,128,0.06);  }
  .ge-result-pill[data-result="loss"] { color: var(--loss); border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.06); }
  .ge-result-pill[data-result="draw"] { color: var(--draw); border-color: rgba(250,204,21,0.3);  background: rgba(250,204,21,0.06);  }

  .ge-result-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: currentColor;
  }

  .ge-headline {
    font-family: 'Playfair Display', serif;
    font-size: 40px;
    font-weight: 900;
    letter-spacing: -0.02em;
    text-align: center;
    line-height: 1.05;
    animation: fade-in 0.4s 0.35s both;
  }

  .ge-reason {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    animation: fade-in 0.4s 0.4s both;
  }

  @keyframes fade-in {
    from { opacity: 0; } to { opacity: 1; }
  }

  /* ── players row ── */
  .ge-players {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 24px 32px;
    border-bottom: 1px solid var(--border);
    animation: fade-in 0.5s 0.45s both;
  }

  .ge-player {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ge-player.right { align-items: flex-end; }

  .ge-player-name {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .ge-player-elo {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
  }

  .ge-player-delta {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
  }

  .ge-player-delta.pos { color: var(--win);  }
  .ge-player-delta.neg { color: var(--loss); }
  .ge-player-delta.neu { color: var(--draw); }

  .ge-vs {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 0 20px;
  }

  .ge-vs-text {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .ge-score {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  /* ── stats row ── */
  .ge-stats {
    display: flex;
    padding: 20px 32px;
    border-bottom: 1px solid var(--border);
    animation: fade-in 0.5s 0.5s both;
  }

  .ge-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .ge-stat + .ge-stat {
    border-left: 1px solid var(--border);
  }

  .ge-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .ge-stat-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }

  /* ── actions ── */
  .ge-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 24px 32px 28px;
    animation: fade-in 0.5s 0.55s both;
  }

  .ge-btn-primary {
    width: 100%;
    padding: 14px 24px;
    background: var(--accent);
    color: var(--bg);
    border: none;
    border-radius: 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    letter-spacing: 0.01em;
  }

  .ge-btn-primary:hover  { opacity: 0.85; transform: translateY(-1px); }
  .ge-btn-primary:active { opacity: 0.7;  transform: translateY(0); }

  .ge-btn-row {
    display: flex;
    gap: 10px;
  }

  .ge-btn-secondary {
    flex: 1;
    padding: 12px 16px;
    background: transparent;
    color: var(--muted2);
    border: 1px solid var(--border);
    border-radius: 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 400;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    letter-spacing: 0.01em;
  }

  .ge-btn-secondary:hover {
    background: rgba(255,255,255,0.05);
    border-color: var(--border-h);
    color: var(--accent);
    transform: translateY(-1px);
  }

  /* ── confetti particles (win only) ── */
  .ge-confetti-wrap {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 50;
    overflow: hidden;
  }

  .ge-confetti-piece {
    position: absolute;
    top: -10px;
    width: 6px;
    height: 6px;
    border-radius: 1px;
    animation: confetti-fall linear both;
    opacity: 0;
  }

  @keyframes confetti-fall {
    0%   { transform: translateY(0)    rotate(0deg);   opacity: 1; }
    80%  { opacity: 1; }
    100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
  }
`;

/* ─────────────────────── confetti generator ─────────────────────── */
const CONFETTI_COLORS = ["#ffffff", "#4ade80", "#facc15", "rgba(255,255,255,0.4)"];

function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: `${Math.random() * 1.2}s`,
    duration: `${2.4 + Math.random() * 1.6}s`,
  }));

  return (
    <div className="ge-confetti-wrap" aria-hidden>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="ge-confetti-piece"
          style={{
            left: p.left,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────── result config ─────────────────────── */
const RESULT_CONFIG = {
  win:  { icon: "♛", headline: "Victory",  score: "1 — 0" },
  loss: { icon: "♟", headline: "Defeated",  score: "0 — 1" },
  draw: { icon: "⚖", headline: "Draw",      score: "½ — ½" },
};

/* ─────────────────────────── component ─────────────────────────── */
export default function GameEndPage({
  result = "win",
  reason = "Checkmate",
  playerName = "You",
  opponentName = "Opponent",
  playerElo = 1204,
  opponentElo = 1198,
  eloDelta = 12,
  moves = 34,
  duration = "4:21",
  pgn = "",
}: GameEndPageProps) {
  const router = useRouter();
  const cfg = RESULT_CONFIG[result];

  const deltaSign = result === "win" ? "+" : result === "loss" ? "-" : "±";
  const deltaClass = result === "win" ? "pos" : result === "loss" ? "neg" : "neu";

  function handleRematch() {
    router.push("/game");
  }

  function handleHome() {
    router.push("/");
  }

  function handleAnalyze() {
    // placeholder — wire to your analysis route
    console.log("Analyze PGN:", pgn);
  }

  return (
    <>
      <style>{styles}</style>

      {result === "win" && <Confetti />}

      <div className="ge-wm ge-wm-tl" aria-hidden>♚</div>
      <div className="ge-wm ge-wm-br" aria-hidden>♜</div>

      <div className="ge-root">
        <div className="ge-card">

          {/* ── Banner ── */}
          <div className="ge-banner" data-result={result}>
            <div className="ge-result-icon">{cfg.icon}</div>

            <div className="ge-result-pill" data-result={result}>
              <span className="ge-result-dot" />
              {result === "win" ? "Victory" : result === "loss" ? "Defeat" : "Draw"}
            </div>

            <h1 className="ge-headline">{cfg.headline}</h1>
            <p className="ge-reason">by {reason}</p>
          </div>

          {/* ── Players ── */}
          <div className="ge-players">
            <div className="ge-player">
              <span className="ge-player-name">{playerName}</span>
              <span className="ge-player-elo">{playerElo} ELO</span>
              <span className={`ge-player-delta ${deltaClass}`}>
                {deltaSign}{eloDelta}
              </span>
            </div>

            <div className="ge-vs">
              <span className="ge-vs-text">vs</span>
              <span className="ge-score">{cfg.score}</span>
            </div>

            <div className="ge-player right">
              <span className="ge-player-name">{opponentName}</span>
              <span className="ge-player-elo">{opponentElo} ELO</span>
              <span className={`ge-player-delta ${result === "loss" ? "pos" : result === "win" ? "neg" : "neu"}`}>
                {result === "loss" ? "+" : result === "win" ? "-" : "±"}{eloDelta}
              </span>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="ge-stats">
            <div className="ge-stat">
              <span className="ge-stat-num">{moves}</span>
              <span className="ge-stat-label">Moves</span>
            </div>
            <div className="ge-stat">
              <span className="ge-stat-num">{duration}</span>
              <span className="ge-stat-label">Duration</span>
            </div>
            <div className="ge-stat">
              <span className="ge-stat-num">{playerElo + (result === "win" ? eloDelta : result === "loss" ? -eloDelta : 0)}</span>
              <span className="ge-stat-label">New ELO</span>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="ge-actions">
            <button className="ge-btn-primary" onClick={handleRematch}>
              Play Again
            </button>
            <div className="ge-btn-row">
              <button className="ge-btn-secondary" onClick={handleAnalyze}>
                ♟ Analyze Game
              </button>
              <button className="ge-btn-secondary" onClick={handleHome}>
                ⌂ Home
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}