'use client'
import { useSocket } from "@/context/socketProvider";
import { Chess } from "chess.js";
import { useEffect, useRef, useState } from "react";
import { Chessboard, PieceDropHandlerArgs, PieceHandlerArgs } from "react-chessboard";
import { boardStyles } from "./boardStyles";
import { useRouter } from "next/navigation";
import ChessClock from "./clock";

type Player = 'white' | 'black';

interface ClockState {
  whiteTime: number;
  blackTime: number;
  activePlayer: Player;
  lastMoveTimestamp: number;
}

function pairMoves(history: string[]) {
  const pairs: [string, string | null, number][] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push([history[i], history[i + 1] ?? null, Math.floor(i / 2) + 1]);
  }
  return pairs;
}

export default function WhiteBoard() {
  const chessGameRef = useRef(new Chess());
  const [chessPosition, setChessPosition] = useState(chessGameRef.current.fen());
  const [moves, setMoves] = useState<string[]>([]);
  const socket = useSocket();
  const historyBodyRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [clock, setClock] = useState<ClockState | null>(null);
  const [serverOffset, setServerOffset] = useState(0);

  useEffect(() => {
    if (historyBodyRef.current) {
      historyBodyRef.current.scrollTop = historyBodyRef.current.scrollHeight;
    }
  }, [moves]);

  useEffect(() => {
    if (!socket) return;

    const handler = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      console.log(message)
      if (message.type === "clock_update") {
        setClock(message.clock);
        setServerOffset(message.serverTime - Date.now());
      }

      if (message.type === "opponent_move") {
        chessGameRef.current.load(message.fen);
        setChessPosition(message.fen);
        setMoves(chessGameRef.current.history());
      }

      if (message.type === "move_history") {
        const tempGame = new Chess();
        for (const move of message.history) {
          tempGame.move(move);
        }
        chessGameRef.current = tempGame;
        setChessPosition(tempGame.fen());
        setMoves(message.history);
      }

      if (message.type === "game_over") {
        router.push("/endgame");
      }
    };

    socket.addEventListener("message", handler);
    return () => socket.removeEventListener("message", handler);
  }, [socket]);

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare) return false;

    try {
      const result = chessGameRef.current.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (!result) return false;

      setMoves(chessGameRef.current.history());
      setChessPosition(chessGameRef.current.fen());

      socket?.send(JSON.stringify({
        type: "move",
        move: { from: sourceSquare, to: targetSquare },
      }));

      return true;
    } catch {
      return false;
    }
  }

  function handleResign() {
    socket?.send(JSON.stringify({ type: "endgame" }));
  }

  function canDragPieceWhite({ piece }: PieceHandlerArgs) {
    return piece.pieceType[0] === 'w';
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

      <div className="cb-watermark cb-watermark-tl" aria-hidden>♚</div>
      <div className="cb-watermark cb-watermark-br" aria-hidden>♜</div>

      <div className="cb-wrapper">
        <div className="cb-inner">

          <div className="cb-board-col">
            <div className="cb-board-label">
              <span />
              Live Match · You are White
            </div>

            {/* Opponent (Black) — black clock sits here */}
            <div className="flex gap-3 items-center">
              <div className="bg-white h-12 w-12 rounded-lg">hello</div>
              <div>OPPONENT NAME(RATING)</div>
              {clock && (
                <ChessClock clock={clock} serverTimeOffset={serverOffset} player="black" />
              )}
            </div>

            <div className="cb-board-wrap">
              <Chessboard options={whiteBoardOptions} />
            </div>

            {/* You (White) — white clock sits here */}
            <div className="flex gap-3 items-center">
              <div className="bg-white h-12 w-12 rounded-lg">hello</div>
              <div>YOUR NAME(RATING)</div>
              {clock && (
                <ChessClock clock={clock} serverTimeOffset={serverOffset} player="white" />
              )}
            </div>
          </div>

          <div className="cb-history">
            <div className="cb-history-header">
              <p className="cb-history-title">Move History</p>
              <p className="cb-history-subtitle">
                {moves.length} half-move{moves.length !== 1 ? 's' : ''} played
              </p>
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