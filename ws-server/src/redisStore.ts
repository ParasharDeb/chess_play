import Redis from "ioredis";

// ──────────────────────────────────────────────
// Redis client (singleton)
// ──────────────────────────────────────────────

if (!process.env.REDIS_URL) {
  console.warn("[Redis] REDIS_URL not set — move persistence disabled");
}

export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      tls: process.env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
      lazyConnect: false,
      maxRetriesPerRequest: 3,
    })
  : null;

if (redis) {
  redis.on("connect", () => console.log("[Redis] Connected"));
  redis.on("error", (err: Error) => console.error("[Redis] Error:", err.message));
}

// ──────────────────────────────────────────────
// Key helpers
// ──────────────────────────────────────────────

const gameKey = (id: string) => `game:${id}`;
const movesKey = (id: string) => `game:${id}:moves`;

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface MoveRecord {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  fen: string;
  color: "w" | "b";
  timestamp: number;
}

export interface GameState {
  id: string;
  fen: string;
  whiteTime: number;
  blackTime: number;
  activePlayer: "white" | "black";
  lastMoveTimestamp: number;
  isFinished: boolean;
  result?: string;
  createdAt: number;
}

// ──────────────────────────────────────────────
// Game state (Redis Hash)
// ──────────────────────────────────────────────

export async function saveGameState(state: GameState): Promise<void> {
  if (!redis) return;
  const flat: Record<string, string | number> = {
    id: state.id,
    fen: state.fen,
    whiteTime: state.whiteTime,
    blackTime: state.blackTime,
    activePlayer: state.activePlayer,
    lastMoveTimestamp: state.lastMoveTimestamp,
    isFinished: state.isFinished ? "true" : "false",
    createdAt: state.createdAt,
  };
  if (state.result) flat["result"] = state.result;
  await redis.hset(gameKey(state.id), flat);
  await redis.expire(gameKey(state.id), 60 * 60 * 3); // 3-hr TTL
}

export async function loadGameState(gameId: string): Promise<GameState | null> {
  if (!redis) return null;
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

export async function markGameFinished(gameId: string, result: string): Promise<void> {
  if (!redis) return;
  await redis.hset(gameKey(gameId), { isFinished: "true", result });
  await redis.expire(gameKey(gameId), 60 * 60); // keep 1 hr after finish
}

// ──────────────────────────────────────────────
// Move history (Redis List)
// ──────────────────────────────────────────────

/** Append a move to the game's Redis List (source of truth) */
export async function appendMove(gameId: string, move: MoveRecord): Promise<void> {
  if (!redis) return;
  await redis.rpush(movesKey(gameId), JSON.stringify(move));
  await redis.expire(movesKey(gameId), 60 * 60 * 3);
}

/** Load all moves — used on reconnect to replay board state to client */
export async function loadMoves(gameId: string): Promise<MoveRecord[]> {
  if (!redis) return [];
  const raw = await redis.lrange(movesKey(gameId), 0, -1);
  return raw.map((m: string) => JSON.parse(m) as MoveRecord);
}

export async function deleteGame(gameId: string): Promise<void> {
  if (!redis) return;
  await redis.del(gameKey(gameId), movesKey(gameId));
}
