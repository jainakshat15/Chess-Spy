const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { gameState } = require('./lib/gameState');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', ({ roomId, name }) => {
      let room = gameState.getRoom(roomId);
      
      if (!room) {
        room = gameState.createRoom(roomId);
      }

      if (gameState.isRoomFull(roomId)) {
        socket.emit('room-full');
        return;
      }

      // Determine color
      const existingPlayers = Array.from(room.players.values());
      const color = existingPlayers.length === 0 
        ? (Math.random() > 0.5 ? 'white' : 'black')
        : (existingPlayers[0].color === 'white' ? 'black' : 'white');

      const success = gameState.addPlayer(roomId, socket.id, name, color);
      
      if (!success) {
        socket.emit('room-full');
        return;
      }

      socket.join(roomId);
      socket.data.roomId = roomId; // Store roomId for disconnect handling
      
      const updatedRoom = gameState.getRoom(roomId);
      if (updatedRoom) {
        io.to(roomId).emit('room-updated', {
          room: {
            id: updatedRoom.id,
            status: updatedRoom.status,
            winner: updatedRoom.winner,
            fen: updatedRoom.game.fen(),
            pgn: updatedRoom.game.pgn(),
          },
          players: Array.from(updatedRoom.players.values()),
        });
      }
    });

    socket.on('make-move', ({ roomId, move }) => {
      const result = gameState.makeMove(roomId, move);
      
      if (!result.success) {
        socket.emit('move-error', { error: result.error });
        return;
      }

      const moveCount = gameState.incrementMoveCount(roomId, socket.id);
      const player = gameState.getPlayer(roomId, socket.id);
      
      const room = gameState.getRoom(roomId);
      if (room) {
        io.to(roomId).emit('move-made', {
          move,
          fen: room.game.fen(),
          pgn: room.game.pgn(),
          status: room.status,
          winner: room.winner,
          moveCount,
          playerId: socket.id,
          shouldCapture: moveCount % 5 === 0 && player,
        });
      }
    });

    socket.on('get-room-state', ({ roomId }) => {
      const room = gameState.getRoom(roomId);
      if (room) {
        socket.emit('room-state', {
          room: {
            id: room.id,
            status: room.status,
            winner: room.winner,
            fen: room.game.fen(),
            pgn: room.game.pgn(),
          },
          players: Array.from(room.players.values()),
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Find and remove player from room
      // Track roomId in socket data when player joins
      const playerRoomId = socket.data.roomId;
      
      if (playerRoomId) {
        const room = gameState.getRoom(playerRoomId);
        if (room && room.players.has(socket.id)) {
          gameState.removePlayer(playerRoomId, socket.id);
          
          const updatedRoom = gameState.getRoom(playerRoomId);
          if (updatedRoom) {
            io.to(playerRoomId).emit('room-updated', {
              room: {
                id: updatedRoom.id,
                status: updatedRoom.status,
                winner: updatedRoom.winner,
                fen: updatedRoom.game.fen(),
                pgn: updatedRoom.game.pgn(),
              },
              players: Array.from(updatedRoom.players.values()),
            });
          }
        }
      }
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

