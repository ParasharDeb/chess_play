export const boardStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg:        #0a0a0a;
    --surface:   #111111;
    --border:    rgba(255,255,255,0.08);
    --accent:    #ffffff;
    --muted:     rgba(255,255,255,0.35);
    --pill-bg:   rgba(255,255,255,0.06);
    --grid-line: rgba(255,255,255,0.04);
  }

  .cb-wrapper {
    min-height: 100vh;
    background-color: var(--bg);
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 60px 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
    font-family: 'DM Sans', sans-serif;
    color: var(--accent);
  }

  .cb-inner {
    display: flex;
    gap: 32px;
    align-items: flex-start;
    max-width: 1300px;
    width: 100%;
  }

  /* ── Board side ─────────────── */
  .cb-board-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .cb-board-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--pill-bg);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 6px 16px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    width: fit-content;
  }

  .cb-board-label span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 6px #4ade80;
    animation: pulse-dot 2s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }

  .cb-board-wrap {
    width: clamp(320px, 55vw, 640px);
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 0 80px rgba(0,0,0,0.8), 0 0 0 1px var(--border);
  }

  /* ── Move history panel ─────── */
  .cb-history {
    flex: 1;
    min-width: 240px;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    gap: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    max-height: 640px;
  }

  .cb-history-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--border);
  }

  .cb-history-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.01em;
    margin: 0 0 4px;
  }

  .cb-history-subtitle {
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .cb-history-body {
    overflow-y: auto;
    flex: 1;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.1) transparent;
  }

  .cb-history-body::-webkit-scrollbar { width: 4px; }
  .cb-history-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  .cb-history-empty {
    color: var(--muted);
    font-size: 13px;
    font-style: italic;
    text-align: center;
    padding: 32px 0;
    font-family: 'DM Sans', sans-serif;
  }

  /* move row = pair of half-moves */
  .cb-move-row {
    display: grid;
    grid-template-columns: 28px 1fr 1fr;
    gap: 4px;
    align-items: center;
    animation: slide-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .cb-move-num {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    text-align: right;
    padding-right: 6px;
  }

  .cb-move-cell {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    padding: 5px 10px;
    border-radius: 3px;
    border: 1px solid transparent;
    cursor: default;
    transition: background 0.15s, border-color 0.15s;
  }

  .cb-move-cell:hover {
    background: rgba(255,255,255,0.06);
    border-color: var(--border);
  }

  .cb-move-cell.latest {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.15);
    color: #fff;
  }

  /* ── Watermark chess pieces ─── */
  .cb-watermark {
    position: fixed;
    pointer-events: none;
    opacity: 0.03;
    font-size: 180px;
    line-height: 1;
    user-select: none;
    z-index: 0;
  }
  .cb-watermark-tl { top: -20px; left: -20px; }
  .cb-watermark-br { bottom: -20px; right: -20px; }
`;
