/**
 * Trivia Quiz Minigame
 * Answer relationship and general knowledge questions
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePetStore } from '../../store';
import { highScoreService } from '../../lib/highScoreService';
import { Button } from '../Button';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: 'relationship' | 'general' | 'fun';
  points: number;
}

interface TriviaQuizProps {
  onClose: () => void;
}

const QUESTIONS: Question[] = [
  // Relationship questions
  {
    id: 'r1',
    question: 'What is the traditional gift for a 1st wedding anniversary?',
    options: ['Paper', 'Wood', 'Silver', 'Gold'],
    correctAnswer: 0,
    category: 'relationship',
    points: 10,
  },
  {
    id: 'r2',
    question: 'What percentage of marriages end in divorce worldwide (approx)?',
    options: ['20%', '40%', '60%', '80%'],
    correctAnswer: 1,
    category: 'relationship',
    points: 15,
  },
  {
    id: 'r3',
    question: 'Which hormone is known as the "love hormone"?',
    options: ['Dopamine', 'Serotonin', 'Oxytocin', 'Adrenaline'],
    correctAnswer: 2,
    category: 'relationship',
    points: 10,
  },
  {
    id: 'r4',
    question: 'What is the most popular date activity worldwide?',
    options: ['Movie night', 'Dinner', 'Walk in park', 'Coffee'],
    correctAnswer: 1,
    category: 'relationship',
    points: 10,
  },
  // General knowledge
  {
    id: 'g1',
    question: 'How many hearts does an octopus have?',
    options: ['1', '2', '3', '4'],
    correctAnswer: 2,
    category: 'general',
    points: 15,
  },
  {
    id: 'g2',
    question: 'What is the smallest country in the world?',
    options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
    correctAnswer: 1,
    category: 'general',
    points: 10,
  },
  {
    id: 'g3',
    question: 'Which planet has the most moons?',
    options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
    correctAnswer: 1,
    category: 'general',
    points: 15,
  },
  {
    id: 'g4',
    question: 'What year was the first iPhone released?',
    options: ['2005', '2006', '2007', '2008'],
    correctAnswer: 2,
    category: 'general',
    points: 10,
  },
  // Fun questions
  {
    id: 'f1',
    question: 'What is the most watched TV show of all time?',
    options: ['Friends', 'Game of Thrones', 'Breaking Bad', 'The Office'],
    correctAnswer: 0,
    category: 'fun',
    points: 10,
  },
  {
    id: 'f2',
    question: 'How many bones does a shark have?',
    options: ['0', '206', '300', '1000'],
    correctAnswer: 0,
    category: 'fun',
    points: 20,
  },
  {
    id: 'f3',
    question: 'What is the fear of long words called?',
    options: ['Hippopotomonstrosesquippedaliophobia', 'Arachnophobia', 'Claustrophobia', 'Agoraphobia'],
    correctAnswer: 0,
    category: 'fun',
    points: 25,
  },
  {
    id: 'f4',
    question: 'Which animal can hold its breath for 6 days?',
    options: ['Whale', 'Dolphin', 'Scorpion', 'Seal'],
    correctAnswer: 2,
    category: 'fun',
    points: 20,
  },
];

const QUESTION_TIME = 15; // seconds per question
const QUESTIONS_PER_GAME = 5;

export const TriviaQuiz = ({ onClose }: TriviaQuizProps) => {
  const gainXP = usePetStore(state => state.gainXP);
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'ended'>('menu');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState<number | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  
  // Load high score
  useEffect(() => {
    const existing = highScoreService.getHighScore('triviaquiz', 'normal');
    setHighScore(existing?.score || null);
  }, []);
  
  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || showResult) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer(-1); // Time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState, showResult]);
  
  // Start game
  const startGame = () => {
    // Shuffle and pick questions
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, QUESTIONS_PER_GAME));
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(QUESTION_TIME);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameState('playing');
    setIsNewHighScore(false);
  };
  
  // Handle answer
  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      // Bonus for quick answers
      const timeBonus = Math.floor(timeLeft / 3);
      const streakBonus = streak * 2;
      const totalPoints = currentQuestion.points + timeBonus + streakBonus;
      setScore(prev => prev + totalPoints);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(isCorrect ? 50 : [50, 30, 50]);
    }
    
    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeLeft(QUESTION_TIME);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameState('ended');
      }
    }, 1500);
  };
  
  // Handle game end
  useEffect(() => {
    if (gameState === 'ended' && score > 0) {
      highScoreService.submitScore('triviaquiz', score, 'normal')
        .then(({ isNewHighScore }) => {
          setIsNewHighScore(isNewHighScore);
        });
      
      gainXP(score / 2, 'triviaquiz');
    }
  }, [gameState, score, gainXP]);
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-primary rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            🧠 Trivia Quiz
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Menu State */}
        {gameState === 'menu' && (
          <div className="text-center py-8 space-y-6">
            <div className="text-6xl">🧠</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Test your knowledge!</h3>
              <p className="text-text-secondary text-sm">
                Answer {QUESTIONS_PER_GAME} questions correctly to score points.
                <br />
                Faster answers = more bonus points!
              </p>
            </div>
            {highScore && (
              <p className="text-amber-500 font-bold">
                🏆 High Score: {highScore}
              </p>
            )}
            <Button onClick={startGame} className="w-full py-4">
              Start Quiz
            </Button>
          </div>
        )}
        
        {/* Playing State */}
        {gameState === 'playing' && currentQuestion && (
          <>
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-text-secondary mb-1">
                <span>Question {currentQuestionIndex + 1}/{questions.length}</span>
                <span>Score: {score}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            {/* Timer */}
            <div className={`text-center mb-4 p-2 rounded-lg ${
              timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              ⏱️ {timeLeft}s
              {streak > 1 && (
                <span className="ml-2 text-amber-500">🔥 {streak} streak</span>
              )}
            </div>
            
            {/* Question */}
            <div className="mb-6">
              <p className="text-lg font-bold text-center mb-4">
                {currentQuestion.question}
              </p>
              
              {/* Options */}
              <div className="space-y-2">
                {currentQuestion.options.map((option, idx) => {
                  let buttonClass = 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700';
                  
                  if (showResult) {
                    if (idx === currentQuestion.correctAnswer) {
                      buttonClass = 'bg-green-500 text-white';
                    } else if (idx === selectedAnswer && idx !== currentQuestion.correctAnswer) {
                      buttonClass = 'bg-red-500 text-white';
                    }
                  }
                  
                  return (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => !showResult && handleAnswer(idx)}
                      disabled={showResult}
                      className={`w-full p-3 rounded-xl text-left font-medium transition-colors ${buttonClass}`}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            
            {/* Result feedback */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-center p-3 rounded-lg ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {selectedAnswer === currentQuestion.correctAnswer
                    ? '✅ Correct!'
                    : selectedAnswer === -1
                      ? '⏰ Time\'s up!'
                      : '❌ Wrong!'}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        
        {/* End State */}
        {gameState === 'ended' && (
          <div className="text-center py-8 space-y-6">
            <div className="text-6xl">🎉</div>
            <div>
              <h3 className="text-3xl font-black text-amber-500">{score}</h3>
              <p className="text-text-secondary">Points Scored!</p>
            </div>
            {isNewHighScore && (
              <div className="bg-amber-100 dark:bg-amber-900/40 px-4 py-2 rounded-full text-amber-600 font-bold inline-block">
                🏆 New High Score!
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Exit
              </Button>
              <Button onClick={startGame} className="flex-1">
                Play Again
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
