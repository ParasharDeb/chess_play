"use client";

import { useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from "react-chessboard";

export default function ChessDemo() {
  // maintain game instance across renders
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;

  // board position state
  const [chessPosition, setChessPosition] = useState(chessGame.fen());

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare) return false;

    try {
      const result = chessGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (!result) return false;

      setChessPosition(chessGame.fen());
      return true;
    } catch {
      return false;
    }
  }

  function canDragPieceWhite({ piece }: PieceHandlerArgs) {
    return piece.pieceType[0] === "w";
  }

  function canDragPieceBlack({ piece }: PieceHandlerArgs) {
    return piece.pieceType[0] === "b";
  }

  const whiteBoardOptions = {
    canDragPiece: canDragPieceWhite,
    position: chessPosition,
    onPieceDrop,
    boardOrientation: "white" as const,
    id: "multiplayer-white",
  };

  const blackBoardOptions = {
    canDragPiece: canDragPieceBlack,
    position: chessPosition,
    onPieceDrop,
    boardOrientation: "black" as const,
    id: "multiplayer-black",
  };

  return (
    <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", padding: "10px" }}>
      <div>
        <p style={{ textAlign: "center" }}>White&apos;s perspective</p>
        <div style={{ maxWidth: "400px" }}>
          <Chessboard options={whiteBoardOptions} />
        </div>
      </div>
    </div>
  );
}
