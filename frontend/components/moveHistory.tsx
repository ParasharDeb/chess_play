import { useEffect, useRef } from "react";

function pairMoves(history: string[]) {
  const pairs: [string, string | null, number][] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push([history[i], history[i + 1] ?? null, Math.floor(i / 2) + 1]);
  }
  return pairs;
}

export default function MoveHistory({ moves }: { moves: string[] }) {
  const historyBodyRef = useRef<HTMLDivElement>(null);
  const movePairs = pairMoves(moves);

  /* ── auto-scroll history on new move ── */
  useEffect(() => {
    if (historyBodyRef.current) {
      historyBodyRef.current.scrollTop = historyBodyRef.current.scrollHeight;
    }
  }, [moves]);

  return (
    <div className="cb-history">
      <div className="cb-history-header">
        <p className="cb-history-title">Move History</p>
        <p className="cb-history-subtitle">{moves.length} half-move{moves.length !== 1 ? 's' : ''} played</p>
      </div>

      <div className="cb-history-body" ref={historyBodyRef}>
        {movePairs.length === 0 ? (
          <p className="cb-history-empty">No moves yet — waiting for the game to start.</p>
        ) : (
          movePairs.map(([white, black, num]) => (
            <div
              className="cb-move-row"
              key={num}
              style={{ animationDelay: '0ms' }}
            >
              <span className="cb-move-num">{num}.</span>
              <span
                className={`cb-move-cell${
                  !black && num === movePairs.length ? ' latest' : ''
                }`}
              >
                {white}
              </span>
              {black != null ? (
                <span
                  className={`cb-move-cell${
                    num === movePairs.length ? ' latest' : ''
                  }`}
                >
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
  );
}
