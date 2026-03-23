'use client'
import Navbar from "@/components/Navbar";

const layoutStyles = `
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

  .gl-root {
    display: flex;
    min-height: 100vh;
    background-color: var(--bg);
    font-family: 'DM Sans', sans-serif;
    color: var(--accent);
  }

  .gl-main {
    margin-left: var(--nav-w);
    flex: 1;
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 60px 60px;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .gl-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 48px;
    border-bottom: 1px solid var(--border);
    background: rgba(10,10,10,0.8);
    backdrop-filter: blur(8px);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .gl-topbar-pill {
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
  }

  .gl-topbar-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 6px #4ade80;
    animation: pulse-dot 2s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%,100% { opacity:1; } 50% { opacity:0.2; }
  }

  .gl-topbar-right {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.06em;
  }

  .gl-wm {
    position: fixed;
    pointer-events: none;
    font-size: 200px;
    line-height: 1;
    opacity: 0.025;
    user-select: none;
    z-index: 0;
  }
  .gl-wm-tl { top: -20px; left: 60px; }
  .gl-wm-br { bottom: -20px; right: -20px; }

  @media (max-width: 860px) {
    .gl-topbar { padding: 16px 24px; }
  }
`;

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{layoutStyles}</style>
      <div className="gl-wm gl-wm-tl" aria-hidden>♚</div>
      <div className="gl-wm gl-wm-br" aria-hidden>♜</div>
      
      <div className="gl-root">
        <Navbar />
        <div className="gl-main">
          {children}
        </div>
      </div>
    </>
  );
}
