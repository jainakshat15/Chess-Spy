import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

interface ChessBoardProps {
  fen: string;
  orientation: 'white' | 'black';
  onMove: (move: string) => void;
  disabled?: boolean;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ fen, orientation, onMove, disabled = false }) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [game, setGame] = useState(new Chess(fen));

  useEffect(() => {
    setGame(new Chess(fen));
    setSelectedSquare(null);
    setPossibleMoves([]);
  }, [fen]);

  const getSquareName = (visualRow: number, visualCol: number): string => {
    const files = 'abcdefgh';
    
    // For white: visual row 0 = rank 8, visual row 7 = rank 1
    // For black: visual row 0 = rank 1, visual row 7 = rank 8 (flipped)
    let rank: number;
    let fileIndex: number;
    
    if (orientation === 'white') {
      rank = 8 - visualRow;
      fileIndex = visualCol;
    } else {
      rank = visualRow + 1;
      fileIndex = 7 - visualCol;
    }
    
    return files[fileIndex] + rank;
  };

  const getSquareColor = (row: number, col: number): 'light' | 'dark' => {
    return (row + col) % 2 === 0 ? 'light' : 'dark';
  };

  const handleSquareClick = (square: string) => {
    if (disabled) return;

    const piece = game.get(square as any);
    const isCurrentTurn = game.turn() === (orientation === 'white' ? 'w' : 'b');

    // Deselect if clicking the same square
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    // If a square is selected, try to make a move
    if (selectedSquare) {
      // Only allow moves to possible move squares
      if (possibleMoves.includes(square)) {
        try {
          const move = game.move({
            from: selectedSquare as any,
            to: square as any,
            promotion: 'q',
          });

          if (move) {
            onMove(move.san);
            setSelectedSquare(null);
            setPossibleMoves([]);
            return;
          }
        } catch (error) {
          // Invalid move - just clear selection
          setSelectedSquare(null);
          setPossibleMoves([]);
          return;
        }
      } else {
        // Clicked on a square that's not a valid move
        // If it's a piece of the current player, select it instead
        if (piece && piece.color === (orientation === 'white' ? 'w' : 'b') && isCurrentTurn) {
          setSelectedSquare(square);
          const moves = game.moves({ square: square as any, verbose: true });
          setPossibleMoves(moves.map((m) => m.to));
        } else {
          // Just clear selection
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
        return;
      }
    }

    // No square selected - select this piece if it's the player's turn and their piece
    if (piece && piece.color === (orientation === 'white' ? 'w' : 'b') && isCurrentTurn) {
      setSelectedSquare(square);
      const moves = game.moves({ square: square as any, verbose: true });
      setPossibleMoves(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const getPieceSymbol = (piece: { type: string; color: string } | null): string => {
    if (!piece) return '';
    
    const symbols: { [key: string]: { [key: string]: string } } = {
      w: {
        p: '♙',
        r: '♖',
        n: '♘',
        b: '♗',
        q: '♕',
        k: '♔',
      },
      b: {
        p: '♟',
        r: '♜',
        n: '♞',
        b: '♝',
        q: '♛',
        k: '♚',
      },
    };
    
    return symbols[piece.color]?.[piece.type] || '';
  };

  // Visual rows and cols are always 0-7 (top to bottom, left to right on screen)
  const visualRows = [0, 1, 2, 3, 4, 5, 6, 7];
  const visualCols = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="chess-board">
      {visualRows.map((visualRow) => (
        <div key={visualRow} style={{ display: 'flex' }}>
          {visualCols.map((visualCol) => {
            const square = getSquareName(visualRow, visualCol);
            const piece = game.get(square as any);
            const isSelected = selectedSquare === square;
            const isPossibleMove = possibleMoves.includes(square);
            const squareColor = getSquareColor(visualRow, visualCol);

            return (
              <div
                key={square}
                className={`square ${squareColor} ${isSelected ? 'selected' : ''} ${isPossibleMove ? 'possible-move' : ''}`}
                onClick={() => handleSquareClick(square)}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
              >
                {piece && <span className="piece">{getPieceSymbol(piece)}</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ChessBoard;

