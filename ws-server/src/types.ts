import { WebSocket } from "ws";

export type PlayerColor = "white" | "black";

export interface MovePayload {
  from: string;
  to: string;
  promotion?: string;
}

export interface ClockState {
  whiteTime: number;
  blackTime: number;
  activePlayer: PlayerColor;
  lastMoveTimestamp: number;
}