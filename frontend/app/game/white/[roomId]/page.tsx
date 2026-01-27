"use client";

import { useEffect, useRef, useState } from "react";
import { Chessboard, PieceHandlerArgs, type PieceDropHandlerArgs } from "react-chessboard";
import { Chess } from "chess.js";
import { useParams } from "next/navigation";


export default function Multiplayer() {
  const { roomId } = useParams();

  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;


  const [chessPosition, setChessPosition] = useState(chessGame.fen());

  

  // ✅ When white moves
  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare) return false;

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    };

    
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