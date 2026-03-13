export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  category: 'favorites' | 'memories' | 'preferences' | 'future';
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Favorites
  {
    id: 'fav-color',
    question: "What is your partner's favorite color?",
    options: ['Blue', 'Pink', 'Green', 'Purple'],
    category: 'favorites',
  },
  {
    id: 'fav-food',
    question: "What is your partner's favorite food?",
    options: ['Pizza', 'Sushi', 'Pasta', 'Tacos'],
    category: 'favorites',
  },
  {
    id: 'fav-movie',
    question: "What genre of movies does your partner prefer?",
    options: ['Romance', 'Action', 'Comedy', 'Horror'],
    category: 'favorites',
  },
  
  // Memories
  {
    id: 'first-date',
    question: 'Where did you go on your first date?',
    options: ['Restaurant', 'Movie', 'Park', 'Cafe'],
    category: 'memories',
  },
  {
    id: 'first-gift',
    question: 'What was the first gift you gave each other?',
    options: ['Flowers', 'Jewelry', 'Book', 'Handmade'],
    category: 'memories',
  },
  
  // Preferences
  {
    id: 'morning-night',
    question: 'Is your partner a morning or night person?',
    options: ['Morning', 'Night', 'Both', 'Neither'],
    category: 'preferences',
  },
  {
    id: 'coffee-tea',
    question: 'Does your partner prefer coffee or tea?',
    options: ['Coffee', 'Tea', 'Both', 'Neither'],
    category: 'preferences',
  },
  
  // Future
  {
    id: 'dream-vacation',
    question: "What is your partner's dream vacation destination?",
    options: ['Beach', 'Mountains', 'City', 'Countryside'],
    category: 'future',
  },
];
