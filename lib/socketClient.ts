import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    // Use environment variable for WebSocket server URL
    // In production: should be set to Render WebSocket server URL
    // In local dev: should be set to http://localhost:3001
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    if (!wsUrl) {
      // In development, default to local WebSocket server
      // Check if we're on localhost (development)
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");
      const defaultUrl = isLocalhost ? "http://localhost:3001" : "";

      if (isLocalhost) {
        console.warn(
          "NEXT_PUBLIC_WEBSOCKET_URL not set. Using default http://localhost:3001. " +
            "Make sure WebSocket server is running on port 3001."
        );
      } else {
        console.error(
          "NEXT_PUBLIC_WEBSOCKET_URL not set. WebSocket connection will fail. " +
            "Please set NEXT_PUBLIC_WEBSOCKET_URL environment variable."
        );
      }

      socket = io(defaultUrl, {
        path: "/api/socket",
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });
    } else {
      socket = io(wsUrl, {
        path: "/api/socket",
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });
    }

    // Add connection logging
    socket.on("connect", () => {
      console.log("Socket.IO connected, ID:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket.IO disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
