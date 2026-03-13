/** * Would You Rather - Couple Edition
 * A fun game for couples to learn more about each other*/

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles, RotateCcw } from 'lucide-react';
import { usePetStore } from '../../store';

interface WouldYouRatherProps {
  onClose: () => void;}

type Intensity = 'mild' | 'spicy' | 'hot';

interface Question {
  id: string;
  optionA: string;  optionB: string;
  intensity: Intensity;
}

const QUESTIONS: Question[] = [
  // Mild
  { id: 'w1', optionA: 'Have a movie night at home', optionB: 'Go out for dinner', intensity: 'mild' },
  { id: 'w2', optionA: 'Be woken up with breakfast in bed', optionB: 'Wake up to a clean house', intensity: 'mild' },
  { id: 'w3', optionA: 'Receive a handwritten love letter', optionB: 'Get a surprise gift', intensity: 'mild' },
  { id: 'w4', optionA: 'Go to the beach', optionB: 'Go hiking in the mountains', intensity: 'mild' },
  { id: 'w5', optionA: 'Have a home-cooked meal', optionB: 'Order takeout', intensity: 'mild' },
  { id: 'w6', optionA: 'Watch a romantic comedy', optionB: 'Watch an action movie', intensity: 'mild' },
  { id: 'w7', optionA: 'Stay in and cuddle', optionB: 'Go out dancing', intensity: 'mild' },
  { id: 'w8', optionA: 'Have a picnic in the park', optionB: 'Have a fancy dinner', intensity: 'mild' },
  { id: 'w9', optionA: 'Be surprised with flowers', optionB: 'Be surprised with chocolate', intensity: 'mild' },
  { id: 'w10', optionA: 'Go for a long drive', optionB: 'Stay home and bake together', intensity: 'mild' },
  
  // Spicy
  { id: 'w11', optionA: 'Give a massage', optionB: 'Receive a massage', intensity: 'spicy' },
  { id: 'w12', optionA: 'Be the big spoon', optionB: 'Be the little spoon', intensity: 'spicy' },
  { id: 'w13', optionA: 'Have a candlelit dinner at home', optionB: 'Go to a rooftop restaurant', intensity: 'spicy' },
  { id: 'w14', optionA: 'Slow dance in the living room', optionB: 'Dance in the rain', intensity: 'spicy' },
  { id: 'w15', optionA: 'Write a love poem', optionB: 'Compose a love song', intensity: 'spicy' },
  { id: 'w16', optionA: 'Have breakfast in bed together', optionB: 'Make breakfast together', intensity: 'spicy' },
  { id: 'w17', optionA: 'Kiss in public', optionB: 'Keep PDA private', intensity: 'spicy' },
  { id: 'w18', optionA: 'Be spoiled for a day', optionB: 'Spoil your partner for a day', intensity: 'spicy' },
  
  // Hot
  { id: 'w19', optionA: 'Have a romantic night in', optionB: 'Have an adventurous night out', intensity: 'hot' },
  { id: 'w20', optionA: 'Share one secret fantasy', optionB: 'Hear all of theirs', intensity: 'hot' },
  { id: 'w21', optionA: 'Role play a scenario', optionB: 'Try something new together', intensity: 'hot' },
  { id: 'w22', optionA: 'Be blindfolded', optionB: 'Do the blindfolding', intensity: 'hot' },
  { id: 'w23', optionA: 'Send a flirty text', optionB: 'Receive a flirty text', intensity: 'hot' },
  { id: 'w24', optionA: 'Cook dinner in matching aprons', optionB: 'Order food and focus on each other', intensity: 'hot' },
];

export function WouldYouRather({ onClose }: WouldYouRatherProps) {
  const gainXP = usePetStore(state => state.gainXP);
  
  const [intensity, setIntensity] = useState<Intensity>('mild');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);

  const getRandomQuestion = (): Question => {
    const available = QUESTIONS.filter(
      (q) => q.intensity === intensity && !usedQuestions.has(q.id)
    );
    
    if (available.length === 0) {
      setUsedQuestions(new Set());
      return QUESTIONS.filter((q) => q.intensity === intensity)[0];
    }
    
    return available[Math.floor(Math.random() * available.length)];
  };

  const handleSelect = (option: 'A' | 'B') => {
    setSelectedOption(option);
    setScore((prev) => prev + (intensity === 'hot' ? 15 : intensity === 'spicy' ? 10 : 5));
    setRounds((prev) => prev + 1);
  };

  const handleNextRound = () => {
    if (currentQuestion) {
      setUsedQuestions((prev) => new Set([...prev, currentQuestion.id]));
    }
    setCurrentQuestion(getRandomQuestion());
    setSelectedOption(null);
  };

  const handleStartGame = () => {
    setCurrentQuestion(getRandomQuestion());
    setSelectedOption(null);
  };

  const handleEndGame = () => {
    gainXP(score / 2, 'wouldyourather');
    onClose();
  };

  const intensityColors = {
    mild: 'from-blue-400 to-cyan-500',
    spicy: 'from-orange-400 to-red-500',
    hot: 'from-red-500 to-pink-600',
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
            Would You Rather?
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Game not started */}
          {!currentQuestion && (
            <motion.div
              key="setup"
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
              {rounds > 0 && (
                <div className="text-center mb-4 p-3 bg-bg-secondary rounded-xl">
                  <p className="text-2xl font-bold text-primary-500">{score} points</p>
                  <p className="text-sm text-text-secondary">{rounds} rounds completed</p>
                </div>
              )}

              <button
                onClick={handleStartGame}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-pink-500 text-white font-bold text-lg"
              >
                {rounds > 0 ? 'Continue Playing' : 'Start Game'}
              </button>

              {rounds > 0 && (
                <button
                  onClick={handleEndGame}
                  className="w-full mt-3 py-3 text-center text-text-secondary hover:text-text-primary transition-colors"
                >
                  End Game & Get XP
                </button>
              )}
            </motion.div>
          )}

          {/* Playing - selection phase */}
          {currentQuestion && !selectedOption && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6"
            >
              {/* Intensity badge */}
              <div className="flex justify-center mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${intensityColors[intensity]}`}>
                  {intensity.toUpperCase()}
                </span>
              </div>

              <p className="text-center text-text-secondary mb-6">Choose one!</p>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect('A')}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-pink-400 to-rose-500 text-white font-medium text-left"
                >
                  <span className="text-sm opacity-80">Option A</span>
                  <p className="text-lg">{currentQuestion.optionA}</p>
                </motion.button>

                <div className="text-center text-text-secondary font-bold">VS</div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect('B')}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-medium text-left"
                >
                  <span className="text-sm opacity-80">Option B</span>
                  <p className="text-lg">{currentQuestion.optionB}</p>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Playing - result phase */}
          {currentQuestion && selectedOption && (
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
              
              <h3 className="text-xl font-bold text-text-primary mb-2">
                You chose:
              </h3>
              <p className="text-lg font-medium text-primary-500 mb-4">
                {selectedOption === 'A' ? currentQuestion.optionA : currentQuestion.optionB}
              </p>
              
              <p className="text-text-secondary mb-4">
                +{intensity === 'hot' ? 15 : intensity === 'spicy' ? 10 : 5} points
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleNextRound}
                  className="flex-1 py-3 px-6 rounded-xl bg-primary-500 text-white font-bold"
                >
                  <RotateCcw className="w-5 h-5 inline mr-2" />
                  Next Round
                </button>
                <button
                  onClick={handleEndGame}
                  className="flex-1 py-3 px-6 rounded-xl bg-bg-secondary text-text-primary font-bold"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}