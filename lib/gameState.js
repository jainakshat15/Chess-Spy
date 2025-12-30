const { Chess } = require('chess.js');

class GameStateManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId) {
    const room = {
      id: roomId,
      game: new Chess(),
      players: new Map(),
      status: 'waiting',
      winner: null,
      createdAt: Date.now(),
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  addPlayer(roomId, playerId, name, color) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    if (room.players.size >= 2) return false;
    
    room.players.set(playerId, {
      id: playerId,
      name,
      color,
      moveCount: 0,
    });

    if (room.players.size === 2) {
      room.status = 'playing';
    }

    return true;
  }

  removePlayer(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players.delete(playerId);

    if (room.players.size === 0) {
      this.rooms.delete(roomId);
    } else if (room.players.size === 1 && room.status === 'playing') {
      room.status = 'waiting';
    }
  }

  makeMove(roomId, move) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    try {
      const result = room.game.move(move);
      if (!result) {
        return { success: false, error: 'Invalid move' };
      }

      // Check game status
      if (room.game.isCheckmate()) {
        room.status = 'finished';
        room.winner = room.game.turn() === 'w' ? 'black' : 'white';
      } else if (room.game.isDraw()) {
        room.status = 'finished';
        room.winner = 'draw';
      } else if (room.game.isStalemate()) {
        room.status = 'finished';
        room.winner = 'draw';
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Invalid move' };
    }
  }

  incrementMoveCount(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return 0;

    const player = room.players.get(playerId);
    if (!player) return 0;

    player.moveCount++;
    return player.moveCount;
  }

  getPlayer(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    return room.players.get(playerId);
  }

  isRoomFull(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    return room.players.size >= 2;
  }

  cleanupEmptyRooms() {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.players.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }
}

const gameState = new GameStateManager();

module.exports = { gameState };

