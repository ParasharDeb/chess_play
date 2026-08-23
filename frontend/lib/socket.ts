let socket: WebSocket | null = null;

export function getSocket() {
  if (!socket) {
    socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_ADDRESS ?? "localhost:8080"}`);

    socket.onopen = () => {
      console.log("WS connected");
    };

    socket.onclose = () => {
      console.log("WS disconnected");
    };
  }

  return socket;
}