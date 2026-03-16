'use client'
import { useSocket } from "@/context/socketProvider";
import { Chess } from "chess.js";
import { useEffect, useRef, useState } from "react";
import { Chessboard, PieceDropHandlerArgs, PieceHandlerArgs } from "react-chessboard";
import { boardStyles } from "./boardStyles";
import { useRouter } from "next/navigation";
/* ─────────────────────── move pair helpers ─────────────────────── */
function pairMoves(history: string[]) {
  const pairs: [string, string | null, number][] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push([history[i], history[i + 1] ?? null, Math.floor(i / 2) + 1]);
  }
  return pairs;
}

/* ─────────────────────────── component ─────────────────────────── */
export default function WhiteBoard() {
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;
  const [chessPosition, setChessPosition] = useState(chessGame.fen());
  const [moves, setmoves] = useState<string[]>([]);
  const socket = useSocket();
  const historyBodyRef = useRef<HTMLDivElement>(null);
  const router=useRouter()
  /* ── auto-scroll history on new move ── */
  useEffect(() => {
    if (historyBodyRef.current) {
      historyBodyRef.current.scrollTop = historyBodyRef.current.scrollHeight;
    }
  }, [moves]);

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      if (message.type === "opponent_move") {
        chessGameRef.current.load(message.fen);
        setChessPosition(message.fen);
      }
      if (message.type === "move_history") {
        setmoves(message.history);
      }
      if (message.type === "match_ended") {
        router.push("/endgame")
      }
    };
  }, []);

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare) return false;
    console.log("reached onpiecedrop function");
    try {
      chessGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });
      console.log("sending message");
      socket?.send(
        JSON.stringify({
          type: "move",
          move: {
            from: sourceSquare,
            to: targetSquare,
            timeRemaining: { white: 12, black: 10 },
          },
        })
      );
      console.log("sent message");
      setChessPosition(chessGame.fen());
      return true;
    } catch {
      return false;
    }
  }

  function handleResign() {
    socket?.send(
      JSON.stringify({
        type: "end_game",
      })
    );
  }

  function canDragPieceWhite({ piece }: PieceHandlerArgs) {
    return piece.pieceType[0] === 'w';
  }

  function canDragPieceBlack({ piece }: PieceHandlerArgs) {
    return piece.pieceType[0] === 'b';
  }

  const whiteBoardOptions = {
    canDragPiece: canDragPieceWhite,
    position: chessPosition,
    onPieceDrop,
    boardOrientation: 'white' as const,
    id: 'multiplayer-white',
  };

  const movePairs = pairMoves(moves);

  return (
    <>
      <style>{boardStyles}</style>

      {/* decorative watermark pieces */}
      <div className="cb-watermark cb-watermark-tl" aria-hidden>♚</div>
      <div className="cb-watermark cb-watermark-br" aria-hidden>♜</div>

      <div className="cb-wrapper">
        <div className="cb-inner">

          {/* ── Board column ── */}
          <div className="cb-board-col">
            <div className="cb-board-label">
              <span />
              Live Match · You are White
            </div>
            <div className="flex gap-3">
              <div className="bg-white h-12 w-12 rounded-lg">
                  hello
              </div>
              <div>
                OPPONENT NAME(RATING)
              </div>
            </div>
            <div className="cb-board-wrap">
              <Chessboard options={whiteBoardOptions} />
            </div>
            <div className="flex gap-3">
              <div className="bg-white h-12 w-12 rounded-lg">
                  hello
              </div>
              <div>
                YOUR NAME(RATING)
              </div>
            </div>
          </div>

          {/* ── Move history panel ── */}
          <div className="cb-history">
            <div className="cb-history-header">
              <p className="cb-history-title">Move History</p>
              <p className="cb-history-subtitle">{moves.length} half-move{moves.length !== 1 ? 's' : ''} played</p>
              <button 
              onClick={handleResign}
              className="w-full px-4 py-10 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors m-2 cursor-pointer"
            >
              Resign Match
            </button>
            </div>
            

            <div className="cb-history-body" ref={historyBodyRef}>
              {movePairs.length === 0 ? (
                <p className="cb-history-empty">No moves yet — make your opening.</p>
              ) : (
                movePairs.map(([white, black, num]) => (
                  <div
                    className="cb-move-row"
                    key={num}
                    /* re-key on length so last row always re-animates */
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

        </div>
      </div>
    </>
  );
}