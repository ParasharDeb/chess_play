import { redis } from "./redisClient";

// Redis key helpers
const gameKey = (gameId: string) => `game:${gameId}`;
const movesKey = (gameId: string) => `game:${gameId}:moves`;

export interface MoveRecord {
  from: string;
  to: string;
  promotion?: string;
  san: string;       // Standard Algebraic Notation from chess.js
  fen: string;       // FEN after the move
  color: "w" | "b";
  timestamp: number;
}

export interface GameState {
  id: string;
  fen: string;             // current board FEN
  whiteTime: number;
  blackTime: number;
  activePlayer: "white" | "black";
  lastMoveTimestamp: number;
  isFinished: boolean;
  result?: string;
  createdAt: number;
}

// ──────────────────────────────────────────────
// GAME STATE
// ──────────────────────────────────────────────

/** Persist the full game state snapshot */
export async function saveGameState(state: GameState): Promise<void> {
  await redis.hset(gameKey(state.id), state as unknown as Record<string, string | number | boolean>);
  // 3-hour TTL: games expire if abandoned
  await redis.expire(gameKey(state.id), 60 * 60 * 3);
}

/** Load a game's state (returns null if not found) */
export async function loadGameState(gameId: string): Promise<GameState | null> {
  const raw = await redis.hgetall(gameKey(gameId));
  if (!raw || !raw["id"]) return null;

  return {
    id: raw["id"]!,
    fen: raw["fen"]!,
    whiteTime: Number(raw["whiteTime"]),
    blackTime: Number(raw["blackTime"]),
    activePlayer: raw["activePlayer"] as "white" | "black",
    lastMoveTimestamp: Number(raw["lastMoveTimestamp"]),
    isFinished: raw["isFinished"] === "true",
    result: raw["result"] ?? undefined,
    createdAt: Number(raw["createdAt"]),
  };
}

/** Mark a game as finished in Redis */
export async function markGameFinished(gameId: string, result: string): Promise<void> {
  await redis.hset(gameKey(gameId), { isFinished: "true", result });
  // Keep finished games for 1 hour for result lookup
  await redis.expire(gameKey(gameId), 60 * 60);
}

// ──────────────────────────────────────────────
// MOVE HISTORY
// ──────────────────────────────────────────────

/** Append a move to the game's move list (stored as a Redis List) */
export async function appendMove(gameId: string, move: MoveRecord): Promise<void> {
  await redis.rpush(movesKey(gameId), JSON.stringify(move));
  await redis.expire(movesKey(gameId), 60 * 60 * 3);
}

/** Load all moves for a game (used for reconnect) */
export async function loadMoves(gameId: string): Promise<MoveRecord[]> {
  const raw = await redis.lrange(movesKey(gameId), 0, -1);
  return raw.map((m) => JSON.parse(m) as MoveRecord);
}

/** Delete all Redis data for a game */
export async function deleteGame(gameId: string): Promise<void> {
  await redis.del(gameKey(gameId), movesKey(gameId));
}
