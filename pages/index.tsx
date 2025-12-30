import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { requestCameraPermission } from "@/lib/camera";
import { generateRandomName } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [cameraGranted, setCameraGranted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    requestCamera();
  }, []);

  const requestCamera = async () => {
    setIsRequesting(true);
    setCameraError(null);
    const stream = await requestCameraPermission();

    if (stream) {
      setCameraGranted(true);
      // Store stream for later use
      (window as any).cameraStream = stream;
    } else {
      setCameraError(
        "Camera permission denied. Please allow camera access to continue."
      );
    }
    setIsRequesting(false);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) {
      alert("Please enter a room ID");
      return;
    }

    if (!cameraGranted) {
      alert("Please grant camera permission first");
      return;
    }

    router.push(`/room/${roomId.trim()}`);
  };

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
      <div className="card" style={{ maxWidth: "500px", width: "100%" }}>
        <h1
          style={{
            textAlign: "center",
            marginBottom: "32px",
            color: "#333",
            fontSize: "clamp(24px, 6vw, 32px)",
          }}
        >
          ChessMate
        </h1>

        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              marginBottom: "16px",
              color: "#555",
              fontSize: "clamp(18px, 4vw, 22px)",
            }}
          >
            Camera Permission
          </h2>
          {cameraGranted ? (
            <div className="status-message success">
              ✓ Camera permission granted
            </div>
          ) : (
            <div>
              <div
                className="status-message error"
                style={{ marginBottom: "12px" }}
              >
                {cameraError || "Camera permission required"}
              </div>
              <button
                className="button"
                onClick={requestCamera}
                disabled={isRequesting}
                style={{ width: "100%" }}
              >
                {isRequesting ? "Requesting..." : "Grant Camera Permission"}
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleJoinRoom}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="roomId"
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#555",
                fontWeight: 600,
              }}
            >
              Enter Room ID
            </label>
            <input
              id="roomId"
              type="text"
              className="input"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              maxLength={20}
              disabled={!cameraGranted}
            />
          </div>
          <button
            type="submit"
            className="button"
            disabled={!cameraGranted || !roomId.trim()}
            style={{ width: "100%" }}
          >
            Join Room
          </button>
        </form>

        <p
          style={{
            marginTop: "24px",
            textAlign: "center",
            color: "#666",
            fontSize: "clamp(12px, 3vw, 14px)",
          }}
        >
          Share the room ID with a friend to play together!
        </p>
      </div>
    </div>
  );
}
