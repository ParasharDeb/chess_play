"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

const SocketContext = createContext<WebSocket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = getSocket();
    
    // Set up the message handler at the provider level so it persists across navigation
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Message received:", message.type, message);
      
      // Dispatch custom event so components can listen to specific messages
      window.dispatchEvent(new CustomEvent("socketMessage", { detail: message }));
    };

    setSocket(ws);
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

export function useSocketMessage(type: string, callback: (message: any) => void) {
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail.type === type) {
        callback(customEvent.detail);
      }
    };

    window.addEventListener("socketMessage", handler);
    return () => window.removeEventListener("socketMessage", handler);
  }, [type, callback]);
}