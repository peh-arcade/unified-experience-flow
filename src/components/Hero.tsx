import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Main Title */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-accent animate-pulse" />
            <span className="text-accent font-semibold tracking-wide">ULTIMATE GAMING</span>
            <Sparkles className="w-6 h-6 text-accent animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-300% animate-glow-pulse">
              Arcade Hub
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Immerse yourself in classic arcade games reimagined with modern technology. 
            Play anywhere, anytime, on any device.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button className="game-btn-primary text-lg px-10 py-4 group">
              <Zap className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              Start Playing
            </button>
            <button className="game-btn-secondary text-lg px-10 py-4">
              View Leaderboard
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent">4+</div>
              <div className="text-sm text-muted-foreground">Games</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent">100%</div>
              <div className="text-sm text-muted-foreground">Free</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent">∞</div>
              <div className="text-sm text-muted-foreground">Fun</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};