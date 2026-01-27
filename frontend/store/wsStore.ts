import { create } from "zustand";

type WSStore = {
  socket: WebSocket | null;
  connect: () => void;
  sendMessage: (data: any) => void;
};

export const useWSStore = create<WSStore>((set, get) => ({
  socket: null,

  connect: () => {
    // prevent multiple connections
    if (get().socket) return;

    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("WS Connected");
    };

    ws.onmessage = (event) => {
      console.log("From server:", event.data);
    };

    ws.onclose = () => {
      console.log("WS Closed");
      set({ socket: null });
      setTimeout(() => get().connect(), 2000); // for reconnection
    };

    set({ socket: ws });
  },

  sendMessage: (data) => {
    const socket = get().socket;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else {
      console.warn("Socket not connected");
    }
  },
}));
