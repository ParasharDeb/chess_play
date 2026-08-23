'use client'
import { useSocket } from "@/context/socketProvider";
import { Chess } from "chess.js";
import { useEffect, useRef, useState } from "react";
import { Chessboard, PieceDropHandlerArgs, PieceHandlerArgs } from "react-chessboard";
import { boardStyles } from "./boardStyles";
import { useRouter, useParams } from "next/navigation";
import ChessClock from "./clock";
import axios from "axios";

type Player = 'white' | 'black';

interface ClockState {
  whiteTime: number;
  blackTime: number;
  activePlayer: Player;
  lastMoveTimestamp: number;
}

interface PlayerInfo {
  name: string;
  rating: number;
}

function pairMoves(history: string[]) {
  const pairs: [string, string | null, number][] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push([history[i], history[i + 1] ?? null, Math.floor(i / 2) + 1]);
  }
  return pairs;
}

/* ── Player card ──────────────────────────────────────────────── */
function PlayerCard({
  name,
  rating,
  icon,
  isYou,
}: {
  name: string;
  rating?: number;
  icon: string;
  isYou: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: isYou ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            color: '#fff',
            fontSize: 14,
            lineHeight: 1.3,
          }}
        >
          {name}
          {isYou && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 10,
                fontFamily: "'DM Mono', monospace",
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.05em',
              }}
            >
              (you)
            </span>
          )}
        </p>
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: 'rgba(255,255,255,0.4)',
            marginTop: 1,
          }}
        >
          {rating !== undefined ? `${rating} ELO` : '— ELO'}
        </p>
      </div>
    </div>
  );
}

export default function BlackBoard() {
  const chessGameRef = useRef(new Chess());
  const [chessPosition, setChessPosition] = useState(chessGameRef.current.fen());
  const [moves, setMoves] = useState<string[]>([]);
  const socket = useSocket();
  const router = useRouter();
  const historyBodyRef = useRef<HTMLDivElement>(null);
  const params = useParams();

  // Extract gameId from [...roomID] catchall param
  const gameId = Array.isArray(params?.roomID)
    ? params.roomID[0]
    : (params?.roomID as string | undefined) ?? "";

  const [clock, setClock] = useState<ClockState | null>(null);
  const [serverOffset, setServerOffset] = useState(0);
  const [myInfo, setMyInfo] = useState<PlayerInfo | null>(null);
  const [opponentName, setOpponentName] = useState<string>("Opponent");
  const historyRequestedRef = useRef(false);

  /* ── auto-scroll move history ── */
  useEffect(() => {
    if (historyBodyRef.current) {
      historyBodyRef.current.scrollTop = historyBodyRef.current.scrollHeight;
    }
  }, [moves]);

  /* ── fetch own user info from Express ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`http://${process.env.NEXT_PUBLIC_IP_ADDRESS}/getuser`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMyInfo(res.data))
      .catch((err) => console.error("[BlackBoard] Failed to fetch user info:", err));
  }, []);

  /* ── request move history from WS on connect ── */
  useEffect(() => {
    if (!socket || !gameId || historyRequestedRef.current) return;
    historyRequestedRef.current = true;
    socket.send(JSON.stringify({ type: "get_history", gameId }));
  }, [socket, gameId]);

  /* ── WS message handler ── */
  useEffect(() => {
    if (!socket) return;

    const handler = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      console.log("[BlackBoard] msg:", message.type, message);

      if (message.type === "clock_update") {
        setClock(message.clock);
        setServerOffset(message.serverTime - Date.now());
      }

      if (message.type === "opponent_move") {
        // Use chess.move() instead of chess.load() so we can grab the SAN
        // and append it to our in-memory list without losing history.
        const result = chessGameRef.current.move(message.move);
        if (result) {
          setMoves((prev) => [...prev, result.san]);
        } else {
          // Fallback: sync position from authoritative FEN
          chessGameRef.current.load(message.fen);
        }
        setChessPosition(message.fen);
      }

      /* move_history: bootstrap the full in-memory array from Redis SANs */
      if (message.type === "move_history") {
        if (message.opponentName) setOpponentName(message.opponentName);
        const tempGame = new Chess();
        const sanList: string[] = [];
        for (const san of (message.history as string[])) {
          try {
            const r = tempGame.move(san);
            if (r) sanList.push(r.san);
          } catch { /* skip invalid */ }
        }
        chessGameRef.current = tempGame;
        setChessPosition(tempGame.fen());
        setMoves(sanList);   // explicit array — source of truth
      }

      if (message.type === "game_over") {
        router.push("/endgame");
      }
    };

    socket.addEventListener("message", handler);
    return () => socket.removeEventListener("message", handler);
  }, [socket, router]);

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare) return false;

    try {
      const result = chessGameRef.current.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (!result) return false;

      // Append just this move's SAN to the in-memory array
      setMoves((prev) => [...prev, result.san]);
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

  function canDragPieceBlack({ piece }: PieceHandlerArgs) {
    return piece.pieceType[0] === 'b';
  }

  function handleResign() {
    socket?.send(JSON.stringify({ type: "endgame" }));
  }

  const blackBoardOptions = {
    canDragPiece: canDragPieceBlack,
    position: chessPosition,
    onPieceDrop,
    boardOrientation: 'black' as const,
    id: 'multiplayer-black',
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
              Live Match · You are Black
            </div>

            {/* Opponent (White) above the board */}
            <div className="flex gap-3 items-center" style={{ marginBottom: 4 }}>
              <PlayerCard name={opponentName} icon="♔" isYou={false} />
              {clock && (
                <div style={{ marginLeft: 'auto' }}>
                  <ChessClock clock={clock} serverTimeOffset={serverOffset} player="white" />
                </div>
              )}
            </div>

            <div className="cb-board-wrap">
              <Chessboard options={blackBoardOptions} />
            </div>

            {/* You (Black) below the board */}
            <div className="flex gap-3 items-center" style={{ marginTop: 4 }}>
              <PlayerCard
                name={myInfo?.name ?? "You"}
                rating={myInfo?.rating}
                icon="♛"
                isYou
              />
              {clock && (
                <div style={{ marginLeft: 'auto' }}>
                  <ChessClock clock={clock} serverTimeOffset={serverOffset} player="black" />
                </div>
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
                <p className="cb-history-empty">No moves yet — waiting for the game to start.</p>
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