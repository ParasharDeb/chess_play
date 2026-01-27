'use client'
import { useRef, useState } from "react";
import { Chessboard, PieceHandlerArgs, type PieceDropHandlerArgs } from 'react-chessboard';
import { Chess } from "chess.js";
import { useParams } from "next/navigation";

export default function Multiplayer() {
  const { roomId } = useParams();

  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;

  // track the current position of the chess game in state
  const [chessPosition, setChessPosition] = useState(chessGame.fen());

  // handle piece drop
  function onPieceDrop({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs) {
    if (!targetSquare) {
      return false;
    }

    try {
      chessGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      setChessPosition(chessGame.fen());
      return true;
    } catch {
      return false;
    }
  }

  // allow black to only drag black pieces
  function canDragPieceBlack({ piece }: PieceHandlerArgs) {
    return piece.pieceType[0] === "b";
  }

  // chessboard options for black perspective
  const blackBoardOptions = {
    canDragPiece: canDragPieceBlack,
    position: chessPosition,
    onPieceDrop,
    boardOrientation: "black" as const,
    id: "multiplayer-black",
  };

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
        <p style={{ textAlign: "center" }}>Black&apos;s perspective</p>
        <p>ROOM: {roomId}</p>

        <div style={{ maxWidth: "400px" }}>
          <Chessboard options={blackBoardOptions} />
        </div>
      </div>
    </div>
  );
}
