'use client'
import { Chess } from "chess.js";
import { useRef, useState } from "react";
import { Chessboard, PieceDropHandlerArgs, PieceHandlerArgs } from "react-chessboard";


  export default function game (color:"white"|"black",id:string)  {
    // create a chess game using a ref to maintain the game state across renders
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;

    // track the current position of the chess game in state
    const [chessPosition, setChessPosition] = useState(chessGame.fen());

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
          promotion: 'q' // always promote to a queen for example simplicity
        });

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

    // set the chessboard options for white's perspective
    const whiteBoardOptions = {
      canDragPiece: canDragPieceWhite,
      position: chessPosition,
      onPieceDrop,
      boardOrientation: 'white' as const,
      id: 'multiplayer-white'
    };

    // set the chessboard options for black's perspective
    const blackBoardOptions = {
      canDragPiece: canDragPieceBlack,
      position: chessPosition,
      onPieceDrop,
      boardOrientation: 'black' as const,
      id: 'multiplayer-black'
    };

    // render both chessboards side by side with a gap
    if(color=="white"){
        return <div style={{
      display: 'flex',
      gap: '20px',
      justifyContent: 'center',
      flexWrap: 'wrap',
      padding: '10px'
    }}>
        
        <div>
          <p style={{
          textAlign: 'center'
        }}>White&apos;s perspective</p>
          <div style={{
          maxWidth: '400px'
        }}>
            <Chessboard options={whiteBoardOptions} />
          </div>
        </div>
        </div>

    }
    return <div style={{
      display: 'flex',
      gap: '20px',
      justifyContent: 'center',
      flexWrap: 'wrap',
      padding: '10px'
    }}>

        <div>
          <p style={{
          textAlign: 'center'
        }}>Black&apos;s perspective</p>
          <div style={{
          maxWidth: '400px'
        }}>
            <Chessboard options={blackBoardOptions} />
          </div>
        </div>
      </div>;
  }
