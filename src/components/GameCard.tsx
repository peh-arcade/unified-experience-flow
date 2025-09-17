import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  bestScore?: string;
  onPlay: () => void;
  comingSoon?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  icon: Icon,
  bestScore,
  onPlay,
  comingSoon = false
}) => {
  return (
    <div className="game-card group">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Game Icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-8 h-8 text-primary-foreground" />
          </div>
          {comingSoon && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-accent-foreground">?</span>
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {description}
          </p>
        </div>

        {/* Best Score */}
        {bestScore && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent">🏆</span>
            <span className="text-muted-foreground">Best: {bestScore}</span>
          </div>
        )}

        {/* Play Button */}
        <button
          onClick={onPlay}
          disabled={comingSoon}
          className={`w-full mt-4 ${
            comingSoon 
              ? 'game-btn-secondary opacity-50 cursor-not-allowed' 
              : 'game-btn-primary hover:scale-105'
          }`}
        >
          {comingSoon ? 'Coming Soon' : '▶ Play Now'}
        </button>
      </div>
    </div>
  );
};