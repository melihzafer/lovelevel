import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw, Trophy } from 'lucide-react';
import { usePetStore } from '../../store';
import { Button } from '../Button';
import { highScoreService } from '../../lib/highScoreService';
import { achievementService } from '../../lib/achievementService';

interface MemoryMatchProps {
  onClose: () => void;
}

type CardSymbol = '❤️' | '💕' | '💖' | '💗' | '💘' | '💝' | '💞' | '💟';

interface Card {
  id: number;
  symbol: CardSymbol;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS: CardSymbol[] = ['❤️', '💕', '💖', '💗', '💘', '💝', '💞', '💟'];

export const MemoryMatch = ({ onClose }: MemoryMatchProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'won'>('menu');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [highScore, setHighScore] = useState<number | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  
  const gainXP = usePetStore((state) => state.gainXP);
  
  const getGridSize = () => {
    switch (difficulty) {
      case 'easy': return 4; // 2x2 = 4 cards (2 pairs)
      case 'normal': return 8; // 2x4 = 8 cards (4 pairs)
      case 'hard': return 16; // 4x4 = 16 cards (8 pairs)
    }
  };
  
  const initializeGame = useCallback(() => {
    const size = getGridSize();
    const pairs = size / 2;
    const selectedSymbols = SYMBOLS.slice(0, pairs);
    const cardPairs = [...selectedSymbols, ...selectedSymbols];
    
    // Shuffle
    const shuffled = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameState('playing');
    setIsNewHighScore(false);
    
    // Load high score
    const existing = highScoreService.getHighScore('memorymatch', difficulty);
    setHighScore(existing?.score || null);
  }, [difficulty]);
  
  useEffect(() => {
    if (gameState === 'menu') {
      const existing = highScoreService.getHighScore('memorymatch', difficulty);
      setHighScore(existing?.score || null);
    }
  }, [difficulty, gameState]);
  
  const handleCardClick = (cardId: number) => {
    if (flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
    
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      
      const [first, second] = newFlipped.map(id => cards.find(c => c.id === id)!);
      
      if (first.symbol === second.symbol) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first.id || c.id === second.id 
              ? { ...c, isMatched: true } 
              : c
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first.id || c.id === second.id 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };
  
  // Check for win
  useEffect(() => {
    if (gameState === 'playing' && matches === getGridSize() / 2) {
      setGameState('won');
      
      // Calculate score (lower moves = higher score)
      const baseScore = getGridSize() * 10;
      const efficiency = Math.max(0, baseScore - moves);
      const finalScore = baseScore + efficiency;
      
      // Check high score
      highScoreService.submitScore('memorymatch', finalScore, difficulty)
        .then(({ isNewHighScore }) => {
          setIsNewHighScore(isNewHighScore);
        });
      
      // Award XP
      gainXP(finalScore / 2, 'memorymatch');
      
      // Check achievements
      achievementService.checkScoreAchievement('memorymatch', finalScore);
    }
  }, [matches, gameState, moves, difficulty, gainXP]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-primary rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-text-primary">Memory Match</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        
        {gameState === 'menu' && (
          <div className="space-y-4">
            <p className="text-text-secondary text-center">
              Match all the pairs of hearts!
            </p>
            
            {highScore && (
              <div className="flex items-center justify-center gap-2 text-accent-500">
                <Trophy className="w-5 h-5" />
                <span>Best: {highScore} points</span>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">Difficulty:</p>
              <div className="flex gap-2">
                {(['easy', 'normal', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      difficulty === d
                        ? 'bg-primary-500 text-white'
                        : 'bg-bg-secondary text-text-primary hover:bg-bg-tertiary'
                    }`}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <Button fullWidth onClick={initializeGame}>
              Start Game
            </Button>
          </div>
        )}
        
        {gameState === 'playing' && (
          <div className="space-y-4">
            <div className="flex justify-between text-text-secondary">
              <span>Moves: {moves}</span>
              <span>Matches: {matches}/{getGridSize() / 2}</span>
            </div>
            
            <div 
              className={`grid gap-2 ${
                difficulty === 'easy' ? 'grid-cols-2' :
                difficulty === 'normal' ? 'grid-cols-4' :
                'grid-cols-4'
              }`}
            >
              {cards.map((card) => (
                <motion.button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isMatched}
                  className={`aspect-square rounded-lg text-2xl flex items-center justify-center transition-all ${
                    card.isMatched
                      ? 'bg-success-light text-success'
                      : card.isFlipped
                      ? 'bg-primary-100 dark:bg-primary-900/30'
                      : 'bg-bg-secondary hover:bg-bg-tertiary'
                  }`}
                  whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {card.isFlipped || card.isMatched ? card.symbol : '❓'}
                </motion.button>
              ))}
            </div>
          </div>
        )}
        
        {gameState === 'won' && (
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            
            <h3 className="text-xl font-bold text-text-primary">You Won!</h3>
            
            <p className="text-text-secondary">
              Completed in {moves} moves
            </p>
            
            {isNewHighScore && (
              <p className="text-accent-500 font-medium flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                New High Score!
              </p>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={initializeGame}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
