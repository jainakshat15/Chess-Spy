# Chess Spy

A real-time multiplayer chess game built with Next.js, WebSockets, and in-memory state management.

## Features

- **Real-time multiplayer chess gameplay** via WebSockets (Socket.io)
- **Room-based game system** (2 players per room)
- **Camera monitoring** (captures image every 5 moves per user, optional)
- **No database** - all state in memory
- **Automatic room cleanup** when empty
- **Full chess rules implementation** (checkmate, stalemate, draws)
- **Board orientation** - players see the board from their perspective (white/black)
- **Move highlighting** - visual feedback for selected pieces and possible moves
- **Turn-based validation** - only allows moves on your turn
- **Random player names** - automatically generates unique names for each player
- **Responsive design** - works on desktop and mobile devices
- **Clean, modern UI** with status messages and game state indicators

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. (Optional) Set up monitoring URL in `.env.local`:

```bash
NEXT_PUBLIC_MONITORING_URL=https://your-endpoint.com/api/capture
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Play

1. **Grant camera permission** when prompted on the home page (required to join rooms)
2. **Enter a room ID** (or create a new one by entering any ID)
3. **Share the room ID** with a friend
4. When both players join, the game starts automatically
5. Players are assigned **random names** (e.g., "SwiftKnight123") and **random colors** (white/black)
6. **Make moves** by clicking on a piece to select it, then clicking on a destination square
   - Possible moves are highlighted when a piece is selected
   - You can only move on your turn
   - Pawns automatically promote to queens
7. Game ends when checkmate, stalemate, or draw occurs
8. You can **leave the room** at any time using the "Leave Room" button

## Technical Details

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Custom Node.js server with Socket.io
- **Chess Engine**: chess.js for game logic
- **State Management**: In-memory Map-based storage
- **Real-time**: WebSocket connections for live updates (Socket.io on `/api/socket` path)
- **Camera**: Optional monitoring via `NEXT_PUBLIC_MONITORING_URL` environment variable

## Project Structure

- `server.js` - Custom Next.js server with Socket.io
- `lib/gameState.ts` - In-memory game state management (TypeScript)
- `lib/camera.ts` - Camera permission and image capture utilities
- `lib/socketClient.ts` - Socket.io client connection management
- `lib/utils.ts` - Utility functions (random name generation)
- `pages/index.tsx` - Home page with room entry and camera permission
- `pages/room/[roomId].tsx` - Game room page with real-time gameplay
- `components/ChessBoard.tsx` - Interactive chess board component with move highlighting
- `styles/globals.css` - Global styles and chess board styling

## Notes

- **Camera monitoring** (if `NEXT_PUBLIC_MONITORING_URL` is set):
  - Camera permission is required before joining a room
  - Images are captured silently every 5 moves per user
  - Camera opens, captures, sends, and closes automatically
- **Room management**:
  - Rooms are automatically deleted when all players leave
  - If a player disconnects, another player can join the room
  - Maximum 2 players per room
  - Room state is preserved and synced on reconnection
- **Game features**:
  - Players see the board from their own perspective (white/black orientation)
  - Move validation prevents illegal moves
  - Turn-based gameplay with clear status indicators
  - Automatic pawn promotion to queen
