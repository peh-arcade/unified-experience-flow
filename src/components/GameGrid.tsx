import React from 'react';
import { GameCard } from './GameCard';
import { Gamepad2, Square, Bird, Car } from 'lucide-react';

interface GameGridProps {
  onGameSelect: (gameId: string) => void;
}

export const GameGrid: React.FC<GameGridProps> = ({ onGameSelect }) => {
  const games = [
    {
      id: 'snake',
      title: 'Snake',
      description: 'Classic snake game with modern twists',
      icon: Gamepad2,
      bestScore: '247',
      comingSoon: false
    },
    {
      id: 'tetris', 
      title: 'Tetris',
      description: 'Stack blocks and clear lines',
      icon: Square,
      bestScore: '12,450',
      comingSoon: true
    },
    {
      id: 'flappybird',
      title: 'Flappy Bird',
      description: 'Navigate through obstacles',
      icon: Bird,
      bestScore: '23',
      comingSoon: true
    },
    {
      id: 'racing',
      title: 'Car Racing',
      description: 'High-speed racing adventure',
      icon: Car,
      bestScore: '1,240m',
      comingSoon: true
    }
  ];

  return (
    <section id="games" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ml-2">
              Adventure
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Classic arcade games rebuilt for the modern era. Perfect for quick gaming sessions or competitive play.
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {games.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              icon={game.icon}
              bestScore={game.bestScore}
              onPlay={() => onGameSelect(game.id)}
              comingSoon={game.comingSoon}
            />
          ))}
        </div>

        {/* More Games Coming */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/50 backdrop-blur-sm border border-border/50">
            <span className="text-accent animate-pulse">✨</span>
            <span className="text-sm font-medium text-muted-foreground">
              More games coming soon...
            </span>
            <span className="text-accent animate-pulse">✨</span>
          </div>
        </div>
      </div>
    </section>
  );
};