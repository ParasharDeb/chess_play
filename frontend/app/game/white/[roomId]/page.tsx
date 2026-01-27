"use client";

import { useEffect, useRef, useState } from "react";
import { Chessboard, PieceHandlerArgs, type PieceDropHandlerArgs } from "react-chessboard";
import { Chess } from "chess.js";
import { useParams } from "next/navigation";
import { useWSStore } from "@/store/wsStore";

export default function Multiplayer() {
  const { roomId } = useParams();

  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;

  const moves = useWSStore((s) => s.moves);
  const sendMove = useWSStore((s) => s.sendMove);

  const [chessPosition, setChessPosition] = useState(chessGame.fen());

  // ✅ Sync board whenever moves come from WebSocket
  useEffect(() => {
    chessGame.reset();

    for (const move of moves) {
      chessGame.move(move);
    }

    setChessPosition(chessGame.fen());
  }, [moves, chessGame]);

  // ✅ When white moves
  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare) return false;

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    };

    try {
      // validate locally first
      const result = chessGame.move(move);
      if (!result) return false;

      // update UI instantly
      setChessPosition(chessGame.fen());

      // send move to backend
      sendMove(move);

      return true;
    } catch {
      return false;
    }
  }

  function canDragPieceWhite({ piece }: PieceHandlerArgs) {
    return piece.pieceType.startsWith("w");
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        justifyContent: "center",
        flexWrap: "wrap",
        padding: "10px",
      }}
    >
      <div>
        <p style={{ textAlign: "center" }}>White&apos;s perspective</p>
        <p>Room: {roomId}</p>

        <div style={{ maxWidth: "400px" }}>
          <Chessboard
            options={{
              position: chessPosition,
              onPieceDrop,
              canDragPiece: canDragPieceWhite,
              boardOrientation: "white",
              id: "multiplayer-white",
            }}
          />
        </div>
      </div>
    </div>
  );
}
