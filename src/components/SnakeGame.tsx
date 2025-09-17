import React, { useState, useEffect, useCallback } from 'react';
import { X, RotateCcw, Play, Pause } from 'lucide-react';

interface SnakeGameProps {
  onClose: () => void;
}

interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const SnakeGame: React.FC<SnakeGameProps> = ({ onClose }) => {
  const GRID_SIZE = 20;
  const INITIAL_SNAKE = [{ x: 10, y: 10 }];
  const INITIAL_FOOD = { x: 15, y: 15 };

  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snakeHighScore') || '0');
  });
  const [gameOver, setGameOver] = useState(false);

  const generateFood = useCallback((): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection('RIGHT');
    setIsPlaying(false);
    setScore(0);
    setGameOver(false);
  };

  const moveSnake = useCallback(() => {
    if (!isPlaying || gameOver) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, isPlaying, gameOver, food, generateFood, highScore]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  const startGame = () => {
    if (gameOver) {
      resetGame();
    }
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="game-card w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-sm">🐍</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Snake</h2>
          </div>
          <button
            onClick={onClose}
            className="game-btn-secondary p-2 hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-6">
            <div>
              <div className="text-2xl font-bold text-accent">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{highScore}</div>
              <div className="text-sm text-muted-foreground">Best</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-foreground">{snake.length}</div>
            <div className="text-sm text-muted-foreground">Length</div>
          </div>
        </div>

        {/* Game Board */}
        <div className="relative mb-6">
          <div 
            className="mx-auto bg-game-bg border border-border/50 rounded-xl overflow-hidden"
            style={{ 
              width: `${GRID_SIZE * 20}px`, 
              height: `${GRID_SIZE * 20}px`,
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              const isSnake = snake.some(segment => segment.x === x && segment.y === y);
              const isFood = food.x === x && food.y === y;
              const isHead = snake[0]?.x === x && snake[0]?.y === y;

              return (
                <div
                  key={index}
                  className={`
                    ${isSnake 
                      ? isHead 
                        ? 'bg-accent shadow-lg' 
                        : 'bg-primary'
                      : ''
                    }
                    ${isFood ? 'bg-game-success rounded-full' : ''}
                    transition-all duration-75
                  `}
                />
              );
            })}
          </div>

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <h3 className="text-3xl font-bold text-foreground">Game Over!</h3>
                <p className="text-lg text-muted-foreground">Score: {score}</p>
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

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={gameOver}
              className="game-btn-secondary px-4 py-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={resetGame}
              className="game-btn-secondary px-4 py-2"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Controls Hint */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Use arrow keys or{' '}
              <span className="text-accent font-semibold">WASD</span> to control
            </p>
            <p className="text-xs text-muted-foreground">
              Press <span className="text-accent">Space</span> to pause
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};