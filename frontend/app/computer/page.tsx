'use client'
import { Chess } from 'chess.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Chessboard, PieceDropHandlerArgs, PieceHandlerArgs } from 'react-chessboard';
import { boardStyles } from '@/components/boardStyles';

/* ─────────────────────────── types ──────────────────────────────── */
interface MlResponse {
  best_move: string;   // SAN  e.g. "Nf3"
  uci_move: string;    // UCI  e.g. "g1f3"
  confidence: number;
  legal_moves_count: number;
}

type GameStatus = 'playing' | 'thinking' | 'checkmate' | 'stalemate' | 'draw' | 'error';

/* ─────────────────────────── helpers ────────────────────────────── */
function pairMoves(history: string[]) {
  const pairs: [string, string | null, number][] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push([history[i], history[i + 1] ?? null, Math.floor(i / 2) + 1]);
  }
  return pairs;
}

const ML_API = process.env.NEXT_PUBLIC_ML_API ?? 'http://localhost:8000';

/* ─────────────────────────── extra styles ───────────────────────── */
const extraStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  /* ── thinking bar ── */
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  .thinking-bar {
    height: 3px;
    border-radius: 2px;
    background: linear-gradient(90deg,
      rgba(255,255,255,0.04) 0%,
      rgba(255,255,255,0.22) 40%,
      rgba(255,255,255,0.04) 100%
    );
    background-size: 400px 100%;
    animation: shimmer 1.2s infinite linear;
  }

  /* ── game-over overlay ── */
  .go-overlay {
    position: absolute;
    inset: 0;
    background: rgba(10,10,10,0.82);
    backdrop-filter: blur(6px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    border-radius: 4px;
    z-index: 10;
    animation: fade-in 0.35s ease both;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .go-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 4vw, 46px);
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #fff;
    text-align: center;
  }

  .go-sub {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    text-align: center;
  }

  .go-btn {
    margin-top: 8px;
    padding: 12px 32px;
    background: #fff;
    color: #0a0a0a;
    border: none;
    border-radius: 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
  }
  .go-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .go-btn:active { opacity: 0.75; transform: translateY(0); }

  /* ── confidence badge ── */
  .conf-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(74,222,128,0.08);
    border: 1px solid rgba(74,222,128,0.25);
    border-radius: 999px;
    padding: 4px 12px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #4ade80;
    letter-spacing: 0.05em;
  }
  .conf-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 5px #4ade80;
  }

  /* ── error badge ── */
  .err-badge {
    background: rgba(248,113,113,0.10);
    border: 1px solid rgba(248,113,113,0.30);
    border-radius: 4px;
    padding: 10px 16px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #f87171;
    letter-spacing: 0.05em;
    text-align: center;
  }

  /* ── new-game button in history panel ── */
  .new-game-btn {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 4px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
  }
  .new-game-btn:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.22);
    transform: translateY(-1px);
  }

  /* ── player card row ── */
  .pc-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pc-avatar {
    width: 40px; height: 40px;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .pc-avatar.human  { background: rgba(255,255,255,0.1); }
  .pc-avatar.neural { background: rgba(74,222,128,0.08); }
  .pc-name {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #fff;
    line-height: 1.3;
  }
  .pc-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: rgba(255,255,255,0.38);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* ── stat row in history header ── */
  .stat-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .stat-value {
    font-family: 'DM Mono', monospace;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
  }
  .stat-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    color: rgba(255,255,255,0.38);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function ComputerPage() {
  const chessRef  = useRef(new Chess());
  const histBodyRef = useRef<HTMLDivElement>(null);

  const [fen,        setFen]        = useState(chessRef.current.fen());
  const [moves,      setMoves]      = useState<string[]>([]);
  const [status,     setStatus]     = useState<GameStatus>('playing');
  const [gameResult, setGameResult] = useState('');
  const [lastConf,   setLastConf]   = useState<number | null>(null);
  const [lastMLMove, setLastMLMove] = useState<string | null>(null);
  const [errMsg,     setErrMsg]     = useState('');
  const [moveCount,  setMoveCount]  = useState(0);

  /* auto-scroll history */
  useEffect(() => {
    if (histBodyRef.current) {
      histBodyRef.current.scrollTop = histBodyRef.current.scrollHeight;
    }
  }, [moves]);

  /* ── check game over ── */
  function checkOver(game: Chess): boolean {
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Neural Net' : 'You';
      setGameResult(`${winner} win${winner === 'You' ? '' : 's'} by checkmate`);
      setStatus('checkmate');
      return true;
    }
    if (game.isStalemate()) {
      setGameResult('Stalemate — draw');
      setStatus('stalemate');
      return true;
    }
    if (game.isDraw()) {
      setGameResult('Draw');
      setStatus('draw');
      return true;
    }
    return false;
  }

  /* ── ask the ML model for a move ── */
  const askML = useCallback(async (game: Chess) => {
    setStatus('thinking');
    setErrMsg('');

    try {
      const res = await fetch(`${ML_API}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen: game.fen() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? `HTTP ${res.status}`);
      }

      const data: MlResponse = await res.json();

      /* tiny delay so the "thinking" shimmer is visible */
      await new Promise((r) => setTimeout(r, 500));

      /* parse UCI move: "e2e4" → { from, to, promotion? } */
      const uci = data.uci_move;
      const mlMove = game.move({
        from: uci.slice(0, 2),
        to:   uci.slice(2, 4),
        promotion: uci.length === 5 ? uci[4] : undefined,
      });

      if (!mlMove) throw new Error('ML returned an illegal move');

      setLastConf(data.confidence);
      setLastMLMove(data.best_move);
      setMoves((prev) => [...prev, mlMove.san]);
      setFen(game.fen());
      setMoveCount((c) => c + 1);

      if (!checkOver(game)) setStatus('playing');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrMsg(`ML error: ${msg}`);
      setStatus('error');
    }
  }, []);

  /* ── player drops a piece ── */
  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (status !== 'playing') return false;
    if (!targetSquare) return false;

    const game = chessRef.current;
    if (game.turn() !== 'w') return false;   // player is always white

    try {
      const result = game.move({
        from: sourceSquare,
        to:   targetSquare,
        promotion: 'q',
      });
      if (!result) return false;

      setMoves((prev) => [...prev, result.san]);
      setFen(game.fen());
      setMoveCount((c) => c + 1);

      if (checkOver(game)) return true;

      /* ML responds */
      askML(game);
      return true;
    } catch {
      return false;
    }
  }

  /* only white pieces are draggable */
  function canDrag({ piece }: PieceHandlerArgs) {
    return piece.pieceType[0] === 'w';
  }

  /* ── new game ── */
  function newGame() {
    chessRef.current = new Chess();
    setFen(chessRef.current.fen());
    setMoves([]);
    setStatus('playing');
    setGameResult('');
    setLastConf(null);
    setLastMLMove(null);
    setErrMsg('');
    setMoveCount(0);
  }

  const movePairs  = pairMoves(moves);
  const isGameOver = ['checkmate', 'stalemate', 'draw'].includes(status);

  /* ── board options ── */
  const boardOptions = {
    canDragPiece: canDrag,
    position: fen,
    onPieceDrop,
    boardOrientation: 'white' as const,
    id: 'computer-board',
    customBoardStyle: {
      borderRadius: '4px',
      overflow: 'hidden',
    },
    /* highlight last ML move square */
    ...(lastMLMove ? {} : {}),
  };

  return (
    <>
      <style>{boardStyles}</style>
      <style>{extraStyles}</style>

      <div className="cb-watermark cb-watermark-tl" aria-hidden>♚</div>
      <div className="cb-watermark cb-watermark-br" aria-hidden>♜</div>

      <div className="cb-wrapper">
        <div className="cb-inner">

          {/* ── Board column ── */}
          <div className="cb-board-col">
            <div className="cb-board-label">
              <span />
              vs Neural Net · You are White
            </div>

            {/* Neural Net player row */}
            <div className="pc-row">
              <div className="pc-avatar neural">⚡</div>
              <div>
                <p className="pc-name">Neural Net</p>
                <p className="pc-label">CNN · {lastConf !== null ? `${(lastConf * 100).toFixed(1)}% conf` : 'waiting…'}</p>
              </div>
              {status === 'thinking' && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 80,
                      overflow: 'hidden',
                      borderRadius: 2,
                    }}
                  >
                    <div className="thinking-bar" />
                  </div>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.35)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    THINKING
                  </span>
                </div>
              )}
            </div>

            {/* Board + game-over overlay */}
            <div className="cb-board-wrap" style={{ position: 'relative' }}>
              <Chessboard options={boardOptions} />
              {isGameOver && (
                <div className="go-overlay">
                  <p className="go-title">{
                    status === 'checkmate' ? '♟ Checkmate' :
                    status === 'stalemate' ? '½ Stalemate' :
                    '½ Draw'
                  }</p>
                  <p className="go-sub">{gameResult}</p>
                  <button className="go-btn" onClick={newGame}>Play Again</button>
                </div>
              )}
            </div>

            {/* Human player row */}
            <div className="pc-row">
              <div className="pc-avatar human">♔</div>
              <div>
                <p className="pc-name">You</p>
                <p className="pc-label">Human · White</p>
              </div>
            </div>
          </div>

          {/* ── History / stats panel ── */}
          <div className="cb-history">
            <div className="cb-history-header">
              <p className="cb-history-title">Move History</p>
              <p className="cb-history-subtitle" style={{ marginBottom: 14 }}>
                {moves.length} half-move{moves.length !== 1 ? 's' : ''} played
              </p>

              {/* stat row */}
              <div className="stat-row" style={{ marginBottom: 14 }}>
                <div className="stat-item">
                  <span className="stat-value">{Math.ceil(moveCount / 2)}</span>
                  <span className="stat-label">Full moves</span>
                </div>
                {lastConf !== null && (
                  <div className="stat-item">
                    <span className="stat-value" style={{ color: '#4ade80' }}>
                      {(lastConf * 100).toFixed(1)}%
                    </span>
                    <span className="stat-label">Last confidence</span>
                  </div>
                )}
                {lastMLMove && (
                  <div className="stat-item">
                    <span className="stat-value" style={{ fontSize: 13 }}>{lastMLMove}</span>
                    <span className="stat-label">Last AI move</span>
                  </div>
                )}
              </div>

              {/* error display */}
              {status === 'error' && (
                <div className="err-badge" style={{ marginBottom: 12 }}>
                  ⚠ {errMsg}
                  <br />
                  <span style={{ opacity: 0.6 }}>Make sure the ML server is running on port 8000</span>
                </div>
              )}

              {/* new game */}
              <button className="new-game-btn" onClick={newGame}>↺ New Game</button>
            </div>

            <div className="cb-history-body" ref={histBodyRef}>
              {movePairs.length === 0 ? (
                <p className="cb-history-empty">No moves yet — make your opening move.</p>
              ) : (
                movePairs.map(([white, black, num]) => (
                  <div className="cb-move-row" key={num}>
                    <span className="cb-move-num">{num}.</span>
                    <span className={`cb-move-cell${!black && num === movePairs.length ? ' latest' : ''}`}>
                      {white}
                    </span>
                    {black != null ? (
                      <span className={`cb-move-cell${num === movePairs.length ? ' latest' : ''}`}>
                        {black}
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}