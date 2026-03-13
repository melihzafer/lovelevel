/**
 * Truth or Dare - Couple Edition
 * A fun game for couples to play together
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles, RotateCcw } from 'lucide-react';
import { usePetStore } from '../../store';

interface TruthOrDareProps {
  onClose: () => void;
}

type GameState = 'menu' | 'playing' | 'result';
type Category = 'truth' | 'dare' | 'romantic';
type Intensity = 'mild' | 'spicy' | 'hot';

interface Question {
  id: string;
  text: string;
  category: Category;
  intensity: Intensity;
}

const QUESTIONS: Question[] = [
  // Mild Truth
  { id: 't1', text: "What's your favorite memory of us together?", category: 'truth', intensity: 'mild' },
  { id: 't2', text: 'What was your first impression of me?', category: 'truth', intensity: 'mild' },
  { id: 't3', text: "What's the sweetest thing I\'ve ever done for you?", category: 'truth', intensity: 'mild' },
  { id: 't4', text: 'What do you love most about our relationship?', category: 'truth', intensity: 'mild' },
  { id: 't5', text: "What's your favorite thing about my personality?", category: 'truth', intensity: 'mild' },
  { id: 't6', text: 'What made you fall in love with me?', category: 'truth', intensity: 'mild' },
  { id: 't7', text: "What's your favorite date we've been on?", category: 'truth', intensity: 'mild' },
  { id: 't8', text: 'What song reminds you of me?', category: 'truth', intensity: 'mild' },
  
  // Spicy Truth
  { id: 't9', text: "What's your guilty pleasure that you haven't told me about?", category: 'truth', intensity: 'spicy' },
  { id: 't10', text: 'What\'s your biggest relationship fear?', category: 'truth', intensity: 'spicy' },
  { id: 't11', text: 'What\'s something you\'d like to try together but haven\'t asked?', category: 'truth', intensity: 'spicy' },
  { id: 't12', text: "What's the craziest thing you've done for love?", category: 'truth', intensity: 'spicy' },
  { id: 't13', text: 'What\'s your biggest turn-on?', category: 'truth', intensity: 'spicy' },
  { id: 't14', text: "What's something I do that drives you crazy (in a good way)?", category: 'truth', intensity: 'spicy' },
  
  // Hot Truth
  { id: 't15', text: 'What\'s your favorite fantasy involving us?', category: 'truth', intensity: 'hot' },
  { id: 't16', text: "What's the most adventurous place you'd want to be intimate?", category: 'truth', intensity: 'hot' },
  { id: 't17', text: "What's something you've always wanted to ask me but were afraid to?", category: 'truth', intensity: 'hot' },
  
  // Mild Dare
  { id: 'd1', text: 'Give me a 30-second shoulder massage', category: 'dare', intensity: 'mild' },
  { id: 'd2', text: 'Tell me your cheesiest pickup line', category: 'dare', intensity: 'mild' },
  { id: 'd3', text: 'Sing a verse of your favorite love song to me', category: 'dare', intensity: 'mild' },
  { id: 'd4', text: 'Draw a heart on my hand with your finger', category: 'dare', intensity: 'mild' },
  { id: 'd5', text: 'Tell me 5 things you love about me in 30 seconds', category: 'dare', intensity: 'mild' },
  { id: 'd6', text: 'Send me a cute selfie right now', category: 'dare', intensity: 'mild' },
  { id: 'd7', text: 'Write "I love you" on my palm with your finger', category: 'dare', intensity: 'mild' },
  { id: 'd8', text: 'Give me a butterfly kiss', category: 'dare', intensity: 'mild' },
  
  // Spicy Dare
  { id: 'd9', text: 'Give me a kiss lasting at least 10 seconds', category: 'dare', intensity: 'spicy' },
  { id: 'd10', text: 'Whisper something romantic in my ear', category: 'dare', intensity: 'spicy' },
  { id: 'd11', text: 'Slow dance with me for one minute', category: 'dare', intensity: 'spicy' },
  { id: 'd12', text: 'Write me a short love poem right now', category: 'dare', intensity: 'spicy' },
  { id: 'd13', text: 'Let me style your hair any way I want', category: 'dare', intensity: 'spicy' },
  { id: 'd14', text: 'Give me a piggyback ride for 2 minutes', category: 'dare', intensity: 'spicy' },
  
  // Hot Dare
  { id: 'd15', text: 'Give me a passionate kiss blindfolded', category: 'dare', intensity: 'hot' },
  { id: 'd16', text: 'Massage my neck for 2 minutes', category: 'dare', intensity: 'hot' },
  { id: 'd17', text: 'Let me take a flirty photo of you', category: 'dare', intensity: 'hot' },
  { id: 'd18', text: 'Act out your favorite movie love scene with me', category: 'dare', intensity: 'hot' },
  
  // Romantic (bonus category)
  { id: 'r1', text: 'Write me a love letter and read it aloud', category: 'romantic', intensity: 'mild' },
  { id: 'r2', text: 'Describe our future together in detail', category: 'romantic', intensity: 'mild' },
  { id: 'r3', text: 'Recreate our first date together', category: 'romantic', intensity: 'mild' },
  { id: 'r4', text: 'Write a poem about why you love me', category: 'romantic', intensity: 'mild' },
];

export function TruthOrDare({ onClose }: TruthOrDareProps) {
  const gainXP = usePetStore(state => state.gainXP);
  
  const [gameState, setGameState] = useState<GameState>('menu');
  const [intensity, setIntensity] = useState<Intensity>('mild');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [turns, setTurns] = useState(0);

  const getRandomQuestion = (): Question => {
    const available = QUESTIONS.filter(
      (q) => q.intensity === intensity && !usedQuestions.has(q.id)
    );
    
    if (available.length === 0) {
      // Reset if all questions used
      setUsedQuestions(new Set());
      return QUESTIONS.filter((q) => q.intensity === intensity)[0];
    }
    
    return available[Math.floor(Math.random() * available.length)];
  };

  const handleCategory = (_category: Category) => { const question = getRandomQuestion();
    setCurrentQuestion(question);
    setUsedQuestions((prev) => new Set([...prev, question.id]));
    setGameState('playing');
  };

  const handleComplete = () => {
    setScore((prev) => prev + (currentQuestion?.intensity === 'hot' ? 30 : currentQuestion?.intensity === 'spicy' ? 20 : 10));
    setTurns((prev) => prev + 1);
    setGameState('result');
  };

  const handleSkip = () => {
    setGameState('menu');
  };

  const handleNextTurn = () => {
    setGameState('menu');
    setCurrentQuestion(null);
  };

  const handleEndGame = () => {
    // Award XP based on score
    gainXP(score / 2, 'truthordare');
    onClose();
  };

  const intensityColors = {
    mild: 'from-blue-400 to-cyan-500',
    spicy: 'from-orange-400 to-red-500',
    hot: 'from-red-500 to-pink-600',
  };

  const categoryIcons = {
    truth: '💬',
    dare: '🎯',
    romantic: '💕',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-bg-primary rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${intensityColors[intensity]} p-4 flex justify-between items-center`}>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Truth or Dare
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Menu State */}
          {gameState === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6"
            >
              {/* Intensity selector */}
              <p className="text-sm text-text-secondary mb-3">Choose intensity:</p>
              <div className="flex gap-2 mb-6">
                {(['mild', 'spicy', 'hot'] as Intensity[]).map((i) => (
                  <button
                    key={i}
                    onClick={() => setIntensity(i)}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                      intensity === i
                        ? 'bg-primary-500 text-white'
                        : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                    }`}
                  >
                    {i.charAt(0).toUpperCase() + i.slice(1)}
                  </button>
                ))}
              </div>

              {/* Score display */}
              {turns > 0 && (
                <div className="text-center mb-4 p-3 bg-bg-secondary rounded-xl">
                  <p className="text-2xl font-bold text-primary-500">{score} points</p>
                  <p className="text-sm text-text-secondary">{turns} turns completed</p>
                </div>
              )}

              {/* Category buttons */}
              <div className="space-y-3">
                {(['truth', 'dare', 'romantic'] as Category[]).map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCategory(category)}
                    className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg bg-gradient-to-r ${
                      category === 'truth'
                        ? 'from-blue-500 to-cyan-500'
                        : category === 'dare'
                        ? 'from-orange-500 to-red-500'
                        : 'from-pink-500 to-rose-500'
                    }`}
                  >
                    <span className="mr-2">{categoryIcons[category]}</span>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </motion.button>
                ))}
              </div>

              {turns > 0 && (
                <button
                  onClick={handleEndGame}
                  className="w-full mt-4 py-3 text-center text-text-secondary hover:text-text-primary transition-colors"
                >
                  End Game & Get XP
                </button>
              )}
            </motion.div>
          )}

          {/* Playing State */}
          {gameState === 'playing' && currentQuestion && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6"
            >
              {/* Intensity badge */}
              <div className="flex justify-center mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${intensityColors[intensity]}`}>
                  {currentQuestion.intensity.toUpperCase()}
                </span>
              </div>

              {/* Question */}
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-6xl mb-4"
                >
                  {categoryIcons[currentQuestion.category]}
                </motion.div>
                <p className="text-xl font-medium text-text-primary">
                  {currentQuestion.text}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSkip}
                  className="flex-1 py-3 px-4 rounded-xl bg-bg-secondary text-text-secondary font-medium hover:bg-bg-tertiary transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
                >
                  Done! ✓
                </button>
              </div>
            </motion.div>
          )}

          {/* Result State */}
          {gameState === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-6xl mb-4"
              >
                <Sparkles className="w-16 h-16 mx-auto text-primary-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Great job!</h3>
              <p className="text-text-secondary mb-4">
                +{currentQuestion?.intensity === 'hot' ? 30 : currentQuestion?.intensity === 'spicy' ? 20 : 10} points
              </p>
              <button
                onClick={handleNextTurn}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-pink-500 text-white font-bold"
              >
                <RotateCcw className="w-5 h-5 inline mr-2" />
                Next Turn
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}