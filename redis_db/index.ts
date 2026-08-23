import "dotenv/config";

export { redis } from "./redisClient";
export {
  saveGameState,
  loadGameState,
  markGameFinished,
  appendMove,
  loadMoves,
  deleteGame,
} from "./gameStore";
export type { GameState, MoveRecord } from "./gameStore";
