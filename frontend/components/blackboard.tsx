'use client'
import { useSocket } from "@/context/socketProvider";
import { Chess } from "chess.js";
import { useEffect, useRef, useState } from "react";
import { Chessboard, PieceDropHandlerArgs, PieceHandlerArgs } from "react-chessboard";

export default function Blackboard(){
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;
    const socket = useSocket()
    // track the current position of the chess game in state
    const [chessPosition, setChessPosition] = useState(chessGame.fen());
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

    // render both chessboards side by side with a gap
    return <div style={{
      display: 'flex',
      gap: '20px',
      justifyContent: 'center',
      flexWrap: 'wrap',
      padding: '10px'
    }}>
        

        <div>
          
          <div style={{
          maxWidth: '400px'
        }}>
            <Chessboard options={blackBoardOptions} />
          </div>
        </div>
      </div>;
  }
