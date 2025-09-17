import React, { useState, useEffect, useCallback } from 'react';
import { X, RotateCcw, Play, Pause, ChevronLeft, ChevronRight, RotateCw, ChevronDown } from 'lucide-react';

interface TetrisGameProps {
  onClose: () => void;
}

interface Position {
  x: number;
  y: number;
}

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Tetromino {
  type: TetrominoType;
  position: Position;
  rotation: number;
  shape: number[][];
}

const TETROMINOES = {
  I: [[[1, 1, 1, 1]]],
  O: [[[1, 1], [1, 1]]],
  T: [[[0, 1, 0], [1, 1, 1]], [[1, 0], [1, 1], [1, 0]], [[1, 1, 1], [0, 1, 0]], [[0, 1], [1, 1], [0, 1]]],
  S: [[[0, 1, 1], [1, 1, 0]], [[1, 0], [1, 1], [0, 1]]],
  Z: [[[1, 1, 0], [0, 1, 1]], [[0, 1], [1, 1], [1, 0]]],
  J: [[[1, 0, 0], [1, 1, 1]], [[1, 1], [1, 0], [1, 0]], [[1, 1, 1], [0, 0, 1]], [[0, 1], [0, 1], [1, 1]]],
  L: [[[0, 0, 1], [1, 1, 1]], [[1, 0], [1, 0], [1, 1]], [[1, 1, 1], [1, 0, 0]], [[1, 1], [0, 1], [0, 1]]]
};

const COLORS = {
  I: 'bg-cyan-500',
  O: 'bg-yellow-500',
  T: 'bg-purple-500',
  S: 'bg-green-500',
  Z: 'bg-red-500',
  J: 'bg-blue-500',
  L: 'bg-orange-500'
};

export const TetrisGame: React.FC<TetrisGameProps> = ({ onClose }) => {
  const GRID_WIDTH = 10;
  const GRID_HEIGHT = 20;
  const INITIAL_SPEED = 800;

  const [grid, setGrid] = useState<(TetrominoType | null)[][]>(() => 
    Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoType>(() => 
    Object.keys(TETROMINOES)[Math.floor(Math.random() * 7)] as TetrominoType
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('tetrisHighScore') || '0');
  });

  const generateTetromino = useCallback((type: TetrominoType): Tetromino => {
    return {
      type,
      position: { x: Math.floor(GRID_WIDTH / 2) - 1, y: 0 },
      rotation: 0,
      shape: TETROMINOES[type][0]
    };
  }, []);

  const getRandomTetromino = useCallback((): TetrominoType => {
    const types = Object.keys(TETROMINOES) as TetrominoType[];
    return types[Math.floor(Math.random() * types.length)];
  }, []);

  const isValidPosition = useCallback((piece: Tetromino, newGrid = grid): boolean => {
    const shapes = TETROMINOES[piece.type];
    const shape = shapes[piece.rotation % shapes.length];
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = piece.position.x + x;
          const newY = piece.position.y + y;
          
          if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && newGrid[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, [grid, GRID_WIDTH, GRID_HEIGHT]);

  const placePiece = useCallback((piece: Tetromino): (TetrominoType | null)[][] => {
    const newGrid = grid.map(row => [...row]);
    const shapes = TETROMINOES[piece.type];
    const shape = shapes[piece.rotation % shapes.length];
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = piece.position.x + x;
          const newY = piece.position.y + y;
          if (newY >= 0) {
            newGrid[newY][newX] = piece.type;
          }
        }
      }
    }
    return newGrid;
  }, [grid]);

  const clearLines = useCallback((newGrid: (TetrominoType | null)[][]): { grid: (TetrominoType | null)[][], linesCleared: number } => {
    const linesToClear: number[] = [];
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (newGrid[y].every(cell => cell !== null)) {
        linesToClear.push(y);
      }
    }
    
    if (linesToClear.length === 0) {
      return { grid: newGrid, linesCleared: 0 };
    }
    
    const filteredGrid = newGrid.filter((_, index) => !linesToClear.includes(index));
    const clearedGrid = [
      ...Array(linesToClear.length).fill(null).map(() => Array(GRID_WIDTH).fill(null)),
      ...filteredGrid
    ];
    
    return { grid: clearedGrid, linesCleared: linesToClear.length };
  }, [GRID_WIDTH, GRID_HEIGHT]);

  const movePiece = useCallback((direction: 'left' | 'right' | 'down') => {
    if (!currentPiece || !isPlaying || gameOver) return;

    const newPosition = { ...currentPiece.position };
    
    switch (direction) {
      case 'left':
        newPosition.x -= 1;
        break;
      case 'right':
        newPosition.x += 1;
        break;
      case 'down':
        newPosition.y += 1;
        break;
    }

    const newPiece = { ...currentPiece, position: newPosition };
    
    if (isValidPosition(newPiece)) {
      setCurrentPiece(newPiece);
    } else if (direction === 'down') {
      // Place piece and spawn new one
      const newGrid = placePiece(currentPiece);
      const { grid: clearedGrid, linesCleared } = clearLines(newGrid);
      
      setGrid(clearedGrid);
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + linesCleared * 100 * level);
      
      // Check for game over
      const newPiece = generateTetromino(nextPiece);
      if (!isValidPosition(newPiece, clearedGrid)) {
        setGameOver(true);
        setIsPlaying(false);
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('tetrisHighScore', score.toString());
        }
      } else {
        setCurrentPiece(newPiece);
        setNextPiece(getRandomTetromino());
      }
    }
  }, [currentPiece, isPlaying, gameOver, isValidPosition, placePiece, clearLines, generateTetromino, nextPiece, getRandomTetromino, score, level, highScore]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || !isPlaying || gameOver) return;

    const shapes = TETROMINOES[currentPiece.type];
    const newRotation = (currentPiece.rotation + 1) % shapes.length;
    const newPiece = { ...currentPiece, rotation: newRotation, shape: shapes[newRotation] };
    
    if (isValidPosition(newPiece)) {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, isPlaying, gameOver, isValidPosition]);

  const dropPiece = useCallback(() => {
    if (!currentPiece || !isPlaying || gameOver) return;
    
    let newPiece = { ...currentPiece };
    while (isValidPosition({ ...newPiece, position: { ...newPiece.position, y: newPiece.position.y + 1 } })) {
      newPiece.position.y += 1;
    }
    setCurrentPiece(newPiece);
    movePiece('down');
  }, [currentPiece, isPlaying, gameOver, isValidPosition, movePiece]);

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      movePiece('down');
    }, speed);
    
    return () => clearInterval(interval);
  }, [movePiece, speed, isPlaying]);

  // Level progression
  useEffect(() => {
    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      setSpeed(Math.max(100, INITIAL_SPEED - (newLevel - 1) * 50));
    }
  }, [lines, level, INITIAL_SPEED]);

  // Touch controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece('right');
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece('down');
          break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          rotatePiece();
          break;
        case 'Enter':
          e.preventDefault();
          dropPiece();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotatePiece, dropPiece]);

  const startGame = () => {
    if (gameOver) {
      setGrid(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)));
      setScore(0);
      setLines(0);
      setLevel(1);
      setSpeed(INITIAL_SPEED);
      setGameOver(false);
    }
    const newPiece = generateTetromino(nextPiece);
    setCurrentPiece(newPiece);
    setNextPiece(getRandomTetromino());
    setIsPlaying(true);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setGameOver(false);
    setCurrentPiece(null);
    setGrid(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)));
    setScore(0);
    setLines(0);
    setLevel(1);
    setSpeed(INITIAL_SPEED);
  };

  const renderGrid = () => {
    const displayGrid = grid.map(row => [...row]);
    
    // Add current piece to display grid
    if (currentPiece) {
      const shapes = TETROMINOES[currentPiece.type];
      const shape = shapes[currentPiece.rotation % shapes.length];
      
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const newX = currentPiece.position.x + x;
            const newY = currentPiece.position.y + y;
            if (newY >= 0 && newY < GRID_HEIGHT && newX >= 0 && newX < GRID_WIDTH) {
              displayGrid[newY][newX] = currentPiece.type;
            }
          }
        }
      }
    }
    
    return displayGrid;
  };

  const renderNextPiece = () => {
    const shape = TETROMINOES[nextPiece][0];
    return (
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${shape[0].length}, 1fr)` }}>
        {shape.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={`w-4 h-4 rounded-sm ${cell ? COLORS[nextPiece] : 'bg-muted/30'}`}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="game-card w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-sm">🧩</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Tetris</h2>
          </div>
          <button
            onClick={onClose}
            className="game-btn-secondary p-2 hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Game Stats */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-accent">{score}</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">{highScore}</div>
                <div className="text-sm text-muted-foreground">Best</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">{lines}</div>
                <div className="text-sm text-muted-foreground">Lines</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">{level}</div>
                <div className="text-sm text-muted-foreground">Level</div>
              </div>
            </div>

            {/* Next Piece */}
            <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
              <div className="text-sm text-muted-foreground mb-2">Next</div>
              <div className="flex justify-center">
                {renderNextPiece()}
              </div>
            </div>
          </div>

          {/* Game Board */}
          <div className="relative">
            <div 
              className="mx-auto bg-game-bg border border-border/50 rounded-xl p-2"
              style={{ 
                width: `${GRID_WIDTH * 20 + 16}px`, 
                height: `${GRID_HEIGHT * 20 + 16}px`,
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_HEIGHT}, 1fr)`,
                gap: '1px'
              }}
            >
              {renderGrid().map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className={`w-4 h-4 rounded-sm border border-border/20 ${
                      cell ? COLORS[cell] : 'bg-muted/10'
                    }`}
                  />
                ))
              )}
            </div>

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-bold text-foreground">Game Over!</h3>
                  <p className="text-lg text-muted-foreground">Score: {score}</p>
                  <p className="text-lg text-muted-foreground">Lines: {lines}</p>
                  {score === highScore && score > 0 && (
                    <p className="text-accent font-semibold">🎉 New High Score!</p>
                  )}
                  <button onClick={startGame} className="game-btn-primary">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Play Again
                  </button>
                </div>
              </div>
            )}

            {/* Start Game Overlay */}
            {!isPlaying && !gameOver && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <button onClick={startGame} className="game-btn-primary text-lg px-8 py-4">
                  <Play className="w-5 h-5 mr-2" />
                  Start Game
                </button>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div></div>
              <button
                onClick={rotatePiece}
                disabled={gameOver || !isPlaying}
                className="game-btn-secondary p-3"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <div></div>
              
              <button
                onClick={() => movePiece('left')}
                disabled={gameOver || !isPlaying}
                className="game-btn-secondary p-3"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => movePiece('down')}
                disabled={gameOver || !isPlaying}
                className="game-btn-secondary p-3"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => movePiece('right')}
                disabled={gameOver || !isPlaying}
                className="game-btn-secondary p-3"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={gameOver}
                className="game-btn-secondary flex-1 py-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={resetGame}
                className="game-btn-secondary flex-1 py-2"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">
                Use arrow keys or buttons
              </p>
              <p className="text-xs text-muted-foreground">
                Space/Up: Rotate, Enter: Drop
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};