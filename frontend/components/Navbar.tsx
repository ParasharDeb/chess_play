const NAV_ITEMS = [
  { icon: "♟", label: "Play",    active: true  },
  { icon: "⚔", label: "Puzzles", active: false },
  { icon: "📈", label: "Stats",  active: false },
  { icon: "👥", label: "Friends",active: false },
  { icon: "⚙", label: "Settings",active: false},
];

const navStyles = `
  .gl-nav {
    position: fixed;
    left: 0; top: 0; bottom: 0;
    width: var(--nav-w);
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 0;
    gap: 0;
    z-index: 100;
  }

  .gl-nav-logo {
    font-size: 26px;
    margin-bottom: 36px;
    user-select: none;
  }

  .gl-nav-items {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex: 1;
  }

  .gl-nav-item {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background 0.15s, border-color 0.15s;
    text-decoration: none;
    color: var(--muted);
    background: transparent;
  }

  .gl-nav-item:hover {
    background: rgba(255,255,255,0.05);
    border-color: var(--border);
    color: var(--accent);
  }

  .gl-nav-item.active {
    background: rgba(255,255,255,0.08);
    border-color: var(--border-h);
    color: var(--accent);
  }

  .gl-nav-icon { font-size: 20px; line-height: 1; }
  .gl-nav-label {
    font-family: 'DM Mono', monospace;
    font-size: 8px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .gl-nav-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .gl-nav-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    border: 1px solid var(--border-h);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
  }
`;

export default function Navbar() {
  return (
    <>
      <style>{navStyles}</style>
      <nav className="gl-nav">
        <div className="gl-nav-logo" aria-label="Chess">♛</div>

        <div className="gl-nav-items">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`gl-nav-item${item.active ? ' active' : ''}`}
              title={item.label}
            >
              <span className="gl-nav-icon">{item.icon}</span>
              <span className="gl-nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="gl-nav-bottom">
          <div className="gl-nav-avatar">♟</div>
        </div>
      </nav>
    </>
  );
}