import { INIT_GAME, WAITING, MOVE } from "@/app/constants";
import { create } from "zustand";

type Move = {
  from: string;
  to: string;
  promotion?: string;
};

type Status = "idle" | "waiting" | "playing" | "ended";

type WSStore = {
  socket: WebSocket | null;

  // game state
  status: Status;
  color: "white" | "black" | null;
  roomId: string | null;
  moves: Move[];
  error: string | null;
  result: string | null;

  // actions
  connect: () => void;
  initGame: () => void;
  sendMove: (move: Move) => void;
  reset: () => void;
};

export const useWSStore = create<WSStore>((set, get) => ({
  socket: null,

  status: "idle",
  color: null,
  roomId: null,
  moves: [],
  error: null,
  result: null,

  connect: () => {
    if (get().socket) return;

    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 WS message:", data);

      switch (data.type) {
        case WAITING:
          set({ status: "waiting" });
          break;

        case INIT_GAME:
          set({
            status: "playing",
            color: data.payload.color,
            roomId: data.payload.id, // ✅ FIXED (was roomId before)
            moves: [],
            error: null,
            result: null,
          });
          break;

        case "opponent_move":
          set((state) => ({
            moves: [...state.moves, data.move],
          }));
          break;

        case "game_over":
          set({
            status: "ended",
            result: data.result,
          });
          break;

        case "error":
          set({ error: data.message });
          break;
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket disconnected");
      set({ socket: null });
    };

    ws.onerror = () => {
      set({ error: "WebSocket error" });
    };

    set({ socket: ws });
  },

  initGame: () => {
    const socket = get().socket;
    if (!socket) return;

    socket.send(JSON.stringify({ type: INIT_GAME }));
  },

  sendMove: (move) => {
    const socket = get().socket;
    if (!socket) return;

    socket.send(
      JSON.stringify({
        type: MOVE, // ✅ FIXED (no more "MOVE" string)
        move,
      })
    );

    // optimistic update
    set((state) => ({
      moves: [...state.moves, move],
    }));
  },

  reset: () => {
    set({
      status: "idle",
      color: null,
      roomId: null,
      moves: [],
      error: null,
      result: null,
    });
  },
}));
