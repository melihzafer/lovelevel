export interface HighScore {
  game: 'petminigame' | 'lovecatcher' | 'memorymatch' | 'quiz' | 'whackamole' | 'triviaquiz' | 'reactiontime';
  score: number;
  achievedAt: string;
  difficulty?: 'easy' | 'normal' | 'hard';
}

const HIGH_SCORES_KEY = 'lovelevel-highscores';

class HighScoreService {
  private highScores: Map<string, HighScore> = new Map();
  
  constructor() {
    this.load();
  }
  
  private load(): void {
    try {
      const stored = localStorage.getItem(HIGH_SCORES_KEY);
      if (stored) {
        const scores = JSON.parse(stored) as HighScore[];
        scores.forEach(score => {
          const key = this.getKey(score.game, score.difficulty);
          this.highScores.set(key, score);
        });
      }
    } catch (error) {
      console.error('Failed to load high scores:', error);
    }
  }
  
  private getKey(game: string, difficulty?: string): string {
    return difficulty ? `${game}-${difficulty}` : game;
  }
  
  getHighScore(game: 'petminigame' | 'lovecatcher' | 'memorymatch' | 'quiz' | 'whackamole' | 'triviaquiz' | 'reactiontime', difficulty?: 'easy' | 'normal' | 'hard'): HighScore | null {
    const key = this.getKey(game, difficulty);
    return this.highScores.get(key) || null;
  }
  
  async submitScore(
    game: 'petminigame' | 'lovecatcher' | 'memorymatch' | 'quiz' | 'whackamole' | 'triviaquiz' | 'reactiontime',
    score: number,
    difficulty?: 'easy' | 'normal' | 'hard'
  ): Promise<{ isNewHighScore: boolean; previousBest: number | null }> {
    const key = this.getKey(game, difficulty);
    const existing = this.highScores.get(key);
    
    if (!existing || score > existing.score) {
      const newHighScore: HighScore = {
        game,
        score,
        achievedAt: new Date().toISOString(),
        difficulty,
      };
      
      this.highScores.set(key, newHighScore);
      this.save();
      
      return { isNewHighScore: true, previousBest: existing?.score || null };
    }
    
    return { isNewHighScore: false, previousBest: existing.score };
  }
  
  getAllHighScores(): HighScore[] {
    return Array.from(this.highScores.values());
  }
  
  private save(): void {
    try {
      const scores = Array.from(this.highScores.values());
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
    } catch (error) {
      console.error('Failed to save high scores:', error);
    }
  }
  
  clear(): void {
    this.highScores.clear();
    localStorage.removeItem(HIGH_SCORES_KEY);
  }
}

export const highScoreService = new HighScoreService();
