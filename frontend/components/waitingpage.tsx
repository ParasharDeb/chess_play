'use client'

/* ─────────────────────────── styles ─────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg:         #0a0a0a;
    --surface:    #111111;
    --border:     rgba(255,255,255,0.07);
    --accent:     #ffffff;
    --muted:      rgba(255,255,255,0.35);
    --grid-line:  rgba(255,255,255,0.04);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .wp-root {
    min-height: 100vh;
    background-color: var(--bg);
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 60px 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    color: var(--accent);
    position: relative;
    overflow: hidden;
  }

  /* ── corner watermarks ── */
  .wp-wm {
    position: fixed;
    pointer-events: none;
    font-size: 220px;
    line-height: 1;
    opacity: 0.03;
    user-select: none;
    z-index: 0;
  }
  .wp-wm-tl { top: -30px; left: -30px; }
  .wp-wm-br { bottom: -30px; right: -30px; }

  /* ── center card ── */
  .wp-card {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 36px;
    text-align: center;
    max-width: 480px;
    padding: 0 24px;
  }

  /* ── pill badge ── */
  .wp-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 6px 18px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .wp-pill-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #facc15;
    box-shadow: 0 0 8px #facc15;
    animation: blink 1.4s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.2; }
  }

  /* ── headline ── */
  .wp-headline {
    font-family: 'Playfair Display', serif;
    font-size: clamp(38px, 7vw, 64px);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.02em;
  }

  .wp-headline em {
    font-style: italic;
    color: var(--muted);
  }

  /* ── sub ── */
  .wp-sub {
    font-size: 15px;
    color: var(--muted);
    line-height: 1.6;
    max-width: 340px;
    font-weight: 300;
  }

  /* ── animated board ── */
  .wp-board-wrap {
    position: relative;
    width: 80px;
    height: 80px;
  }

  /* spinning outer ring */
  .wp-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1.5px solid transparent;
    border-top-color: rgba(255,255,255,0.5);
    border-right-color: rgba(255,255,255,0.15);
    animation: spin 1.4s linear infinite;
  }

  .wp-ring-inner {
    position: absolute;
    inset: 10px;
    border-radius: 50%;
    border: 1px solid transparent;
    border-bottom-color: rgba(255,255,255,0.3);
    animation: spin 2.2s linear infinite reverse;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* chess king icon in center */
  .wp-king {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-4px); }
  }

  /* ── dots loader ── */
  .wp-dots {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .wp-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255,255,255,0.5);
    animation: dot-pulse 1.4s ease-in-out infinite;
  }
  .wp-dot:nth-child(1) { animation-delay: 0s; }
  .wp-dot:nth-child(2) { animation-delay: 0.2s; }
  .wp-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes dot-pulse {
    0%, 80%, 100% { transform: scale(1);   opacity: 0.4; }
    40%           { transform: scale(1.6); opacity: 1;   }
  }

  /* ── players online counter ── */
  .wp-stats {
    display: flex;
    gap: 32px;
    border-top: 1px solid var(--border);
    padding-top: 32px;
    width: 100%;
    justify-content: center;
  }

  .wp-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .wp-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .wp-stat-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }

  /* ── divider line ── */
  .wp-divider {
    width: 1px;
    height: 40px;
    background: var(--border);
    align-self: center;
  }

  /* entry animation for the whole card */
  .wp-card {
    animation: card-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes card-in {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ─────────────────────── component ─────────────────────── */
export default function WaitingPageComponent() {
  return (
    <>
      <style>{styles}</style>

      <div className="wp-wm wp-wm-tl" aria-hidden>♚</div>
      <div className="wp-wm wp-wm-br" aria-hidden>♟</div>

      <div className="wp-root">
        <div className="wp-card">

          {/* pill */}
          <div className="wp-pill">
            <span className="wp-pill-dot" />
            Matchmaking
          </div>

          {/* spinner + king */}
          <div className="wp-board-wrap">
            <div className="wp-ring" />
            <div className="wp-ring-inner" />
            <div className="wp-king">♛</div>
          </div>

          {/* headline */}
          <h1 className="wp-headline">
            Seeking your<br /><em>opponent…</em>
          </h1>

          {/* sub */}
          <p className="wp-sub">
            Hang tight. We're pairing you with a worthy challenger from across the globe.
          </p>

          {/* dots */}
          <div className="wp-dots" aria-label="Loading">
            <div className="wp-dot" />
            <div className="wp-dot" />
            <div className="wp-dot" />
          </div>

          {/* stats */}
          <div className="wp-stats">
            <div className="wp-stat">
              <span className="wp-stat-num">12,481</span>
              <span className="wp-stat-label">Players Online</span>
            </div>
            <div className="wp-divider" />
            <div className="wp-stat">
              <span className="wp-stat-num">3,204</span>
              <span className="wp-stat-label">Games Live</span>
            </div>
            <div className="wp-divider" />
            <div className="wp-stat">
              <span className="wp-stat-num">&lt; 30s</span>
              <span className="wp-stat-label">Avg Wait</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}