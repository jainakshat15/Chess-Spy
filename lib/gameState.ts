import { Chess } from 'chess.js';

export interface Player {
  id: string;
  name: string;
  color: 'white' | 'black';
  moveCount: number;
}

export interface Room {
  id: string;
  game: Chess;
  players: Map<string, Player>;
  status: 'waiting' | 'playing' | 'finished';
  winner: 'white' | 'black' | 'draw' | null;
  createdAt: number;
}

// Room data as sent over WebSocket (serialized version)
export interface RoomData {
  id: string;
  status: 'waiting' | 'playing' | 'finished';
  winner: 'white' | 'black' | 'draw' | null;
  fen: string;
  pgn: string;
}

class GameStateManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(roomId: string): Room {
    const room: Room = {
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

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  addPlayer(roomId: string, playerId: string, name: string, color: 'white' | 'black'): boolean {
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

  removePlayer(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players.delete(playerId);

    if (room.players.size === 0) {
      this.rooms.delete(roomId);
    } else if (room.players.size === 1 && room.status === 'playing') {
      room.status = 'waiting';
    }
  }

  makeMove(roomId: string, move: string): { success: boolean; error?: string } {
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

  incrementMoveCount(roomId: string, playerId: string): number {
    const room = this.rooms.get(roomId);
    if (!room) return 0;

    const player = room.players.get(playerId);
    if (!player) return 0;

    player.moveCount++;
    return player.moveCount;
  }

  getPlayer(roomId: string, playerId: string): Player | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    return room.players.get(playerId);
  }

  isRoomFull(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    return room.players.size >= 2;
  }

  cleanupEmptyRooms(): void {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.players.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }
}

export const gameState = new GameStateManager();

