import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Trophy } from 'lucide-react';
import { usePetStore } from '../../store';
import { Button } from '../Button';
import { highScoreService } from '../../lib/highScoreService';
import { QUIZ_QUESTIONS, type QuizQuestion } from '../../data/quizQuestions';

interface RelationshipQuizProps {
  onClose: () => void;
}

export const RelationshipQuiz = ({ onClose }: RelationshipQuizProps) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  
  const gainXP = usePetStore((state) => state.gainXP);
  
  const startGame = () => {
    // Shuffle and pick 5 questions
    const shuffled = [...QUIZ_QUESTIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    setQuestions(shuffled);
    setCurrentQuestion(0);
    setScore(0);
    setGameState('playing');
    setIsNewHighScore(false);
  };
  
  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    // In a real app, you'd check against partner's actual answers
    // For now, we'll simulate correct answers randomly
    const isCorrect = Math.random() > 0.3;
    
    if (isCorrect) {
      setScore(prev => prev + 20);
    }
    
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // Game over
        setGameState('result');
        
        // Check high score
        highScoreService.submitScore('quiz', score, undefined)
          .then(({ isNewHighScore }) => {
            setIsNewHighScore(isNewHighScore);
          });
        
        // Award XP
        gainXP(score, 'relationship-quiz');
      }
    }, 1000);
  };
  
  const currentQ = questions[currentQuestion];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-primary rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary-500" />
            Relationship Quiz
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        
        {gameState === 'menu' && (
          <div className="space-y-4 text-center">
            <p className="text-text-secondary">
              Test how well you know your partner! Answer questions about your relationship.
            </p>
            
            <div className="bg-bg-secondary rounded-lg p-4">
              <p className="text-sm text-text-tertiary">
                5 questions • 20 points each
              </p>
            </div>
            
            <Button fullWidth onClick={startGame}>
              Start Quiz
            </Button>
          </div>
        )}
        
        {gameState === 'playing' && currentQ && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Question {currentQuestion + 1}/{questions.length}</span>
              <span>Score: {score}</span>
            </div>
            
            <div className="w-full bg-bg-tertiary rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-text-primary">
                  {currentQ.question}
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {currentQ.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => !showFeedback && handleAnswer(option)}
                      disabled={showFeedback}
                      className={`p-3 rounded-lg text-text-primary font-medium transition-all ${
                        showFeedback && selectedAnswer === option
                          ? 'bg-primary-500 text-white'
                          : 'bg-bg-secondary hover:bg-bg-tertiary'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
        
        {gameState === 'result' && (
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl"
            >
              {score >= 80 ? '🏆' : score >= 40 ? '💕' : '💪'}
            </motion.div>
            
            <h3 className="text-xl font-bold text-text-primary">
              {score >= 80 ? 'Perfect Score!' : score >= 40 ? 'Great Job!' : 'Keep Learning!'}
            </h3>
            
            <p className="text-text-secondary">
              You scored {score} points
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
              <Button onClick={startGame}>
                Play Again
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
