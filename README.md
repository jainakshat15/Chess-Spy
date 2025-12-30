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

### Local Development

The application consists of two separate servers:

- **Next.js App** (port 3000) - Frontend and UI
- **WebSocket Server** (port 3001) - Real-time game state

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file in the root directory:

```bash
# WebSocket Server URL (required for local development)
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001

# Optional: Monitoring endpoint for camera captures
# NEXT_PUBLIC_MONITORING_URL=https://your-endpoint.com/api/capture
```

3. Run both servers:

**Option A: Run in separate terminals**

Terminal 1 - WebSocket Server:

```bash
npm run dev:ws
```

Terminal 2 - Next.js App:

```bash
npm run dev
```

**Option B: Run both together** (requires `concurrently`):

```bash
npm install --save-dev concurrently
npm run dev:all
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

**Note**: If you see 404 errors for `/api/socket`, make sure:

- The WebSocket server is running on port 3001
- `NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001` is set in `.env.local`

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

- **Frontend**: Next.js 14 with TypeScript (deployed on Vercel)
- **WebSocket Server**: Standalone Node.js server with Socket.io (deployed on Render)
- **Chess Engine**: chess.js for game logic
- **State Management**: In-memory Map-based storage
- **Real-time**: WebSocket connections for live updates (Socket.io on `/api/socket` path)
- **Camera**: Optional monitoring via `NEXT_PUBLIC_MONITORING_URL` environment variable

## Deployment

This application is designed to be deployed on two separate platforms:

- **WebSocket Server**: Render (see `websocket-server.js`)
- **Next.js App**: Vercel (standard Next.js deployment)

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Project Structure

- `server.js` - Next.js custom server (for local development)
- `websocket-server.js` - Standalone WebSocket server (for Render deployment)
- `lib/gameState.ts` - In-memory game state management (TypeScript)
- `lib/camera.ts` - Camera permission and image capture utilities
- `lib/socketClient.ts` - Socket.io client connection management
- `lib/utils.ts` - Utility functions (random name generation)
- `pages/index.tsx` - Home page with room entry and camera permission
- `pages/room/[roomId].tsx` - Game room page with real-time gameplay
- `components/ChessBoard.tsx` - Interactive chess board component with move highlighting
- `styles/globals.css` - Global styles and chess board styling
- `DEPLOYMENT.md` - Detailed deployment guide for Render and Vercel
- `QUICK_DEPLOY.md` - Quick reference for deployment

## CI/CD

This project includes a GitHub Actions workflow:

- **Build Check** (`.github/workflows/build-check.yml`): Runs on every push and pull request to verify the project builds successfully and passes linting

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
