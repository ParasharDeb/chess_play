'use client'
import { useSocket } from "@/context/socketProvider";
import { Chess } from "chess.js";
import { useEffect, useRef, useState } from "react";
import { Chessboard, PieceDropHandlerArgs, PieceHandlerArgs } from "react-chessboard";
import { boardStyles } from "./boardStyles";

/* ─────────────────────── move pair helpers ─────────────────────── */
function pairMoves(history: string[]) {
  const pairs: [string, string | null, number][] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push([history[i], history[i + 1] ?? null, Math.floor(i / 2) + 1]);
  }
  return pairs;
}

/* ─────────────────────────── component ─────────────────────────── */
export default function Blackboard(){
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;
    const socket = useSocket()
    // track the current position of the chess game in state
    const [chessPosition, setChessPosition] = useState(chessGame.fen());
    const [moves, setMoves] = useState<string[]>([]);
    const historyBodyRef = useRef<HTMLDivElement>(null);

    /* ── auto-scroll history on new move ── */
    useEffect(() => {
      if (historyBodyRef.current) {
        historyBodyRef.current.scrollTop = historyBodyRef.current.scrollHeight;
      }
    }, [moves]);

    useEffect(()=>{
          if(!socket) return;
          socket.onmessage=(event)=>{
            const message=JSON.parse(event.data);
            console.log(message)
            if (message.type === "opponent_move") {
              chessGameRef.current.load(message.fen);
              setChessPosition(message.fen)
              console.log(message.fen)
            }
            if (message.type === "move_history") {
              setMoves(message.history);
            }
            if(message.type=="match_ended"){
              //write the function for match ending
            }
            
          }
          
        },[])
    // handle piece drop
    function onPieceDrop({
      sourceSquare,
      targetSquare
    }: PieceDropHandlerArgs) {
      // type narrow targetSquare potentially being null (e.g. if dropped off board)
      if (!targetSquare) {
        return false;
      }
      
      // try to make the move according to chess.js logic
      try {
        chessGame.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q'
        });
        console.log("sending message");
        socket?.send(
          JSON.stringify({
            type: "move",
              move: {
              from: sourceSquare,
              to: targetSquare,
              timeRemaining: { white: 12, black: 10 }
              },
          })
        );
        console.log("sent message")
        // update the position state upon successful move to trigger a re-render of the chessboard
        setChessPosition(chessGame.fen());

        // return true as the move was successful
        return true;
      } catch {
        // return false as the move was not successful
        return false;
      }
    }

    // allow white to only drag white pieces
    function canDragPieceWhite({
      piece
    }: PieceHandlerArgs) {
      return piece.pieceType[0] === 'w';
    }

    // allow black to only drag black pieces
    function canDragPieceBlack({
      piece
    }: PieceHandlerArgs) {
      return piece.pieceType[0] === 'b';
    }

   

    // set the chessboard options for black's perspective
    const blackBoardOptions = {
      canDragPiece: canDragPieceBlack,
      position: chessPosition,
      onPieceDrop,
      boardOrientation: 'black' as const,
      id: 'multiplayer-black'
    };

    const movePairs = pairMoves(moves);

    // render both chessboards side by side with a gap
    return <><style>{boardStyles}</style>

      {/* decorative watermark pieces */}
      <div className="cb-watermark cb-watermark-tl" aria-hidden>♚</div>
      <div className="cb-watermark cb-watermark-br" aria-hidden>♜</div>

      <div className="cb-wrapper">
        <div className="cb-inner">
          {/* ── Board column ── */}
          <div className="cb-board-col">
            <div className="cb-board-label">
              <span />
              Live Match · You are Black
            </div>
            <div className="cb-board-wrap">
              <Chessboard options={blackBoardOptions} />
            </div>
          </div>

          {/* ── Move history panel ── */}
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
        </div>
      </div>
    </>;
  }
