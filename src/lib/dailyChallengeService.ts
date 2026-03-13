export interface DailyChallenge {
  id: string;
  game: 'petminigame' | 'lovecatcher' | 'memorymatch' | 'quiz';
  target: number;
  reward: { xp: number; coins: number };
  completed: boolean;
  expiresAt: string;
}

const STORAGE_KEY = 'lovelevel-daily-challenge';

const CHALLENGE_TEMPLATES = [
  { game: 'petminigame' as const, target: 50, reward: { xp: 30, coins: 15 } },
  { game: 'lovecatcher' as const, target: 100, reward: { xp: 40, coins: 20 } },
  { game: 'memorymatch' as const, target: 30, reward: { xp: 35, coins: 18 } },
  { game: 'quiz' as const, target: 60, reward: { xp: 25, coins: 12 } },
];

class DailyChallengeService {
  private challenge: DailyChallenge | null = null;
  
  constructor() {
    this.load();
  }
  
  private load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const challenge = JSON.parse(stored) as DailyChallenge;
        
        // Check if expired
        if (new Date(challenge.expiresAt) > new Date()) {
          this.challenge = challenge;
        } else {
          this.generateNew();
        }
      } else {
        this.generateNew();
      }
    } catch {
      this.generateNew();
    }
  }
  
  private generateNew(): void {
    const template = CHALLENGE_TEMPLATES[Math.floor(Math.random() * CHALLENGE_TEMPLATES.length)];
    
    // Set expiry to end of day
    const now = new Date();
    const expiresAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    this.challenge = {
      id: crypto.randomUUID(),
      game: template.game,
      target: template.target,
      reward: template.reward,
      completed: false,
      expiresAt: expiresAt.toISOString(),
    };
    
    this.save();
  }
  
  get(): DailyChallenge | null {
    // Refresh if expired
    if (this.challenge && new Date(this.challenge.expiresAt) <= new Date()) {
      this.generateNew();
    }
    return this.challenge;
  }
  
  checkProgress(game: string, score: number): { completed: boolean; reward: { xp: number; coins: number } | null } {
    if (!this.challenge || this.challenge.completed || this.challenge.game !== game) {
      return { completed: false, reward: null };
    }
    
    if (score >= this.challenge.target) {
      this.challenge.completed = true;
      this.save();
      return { completed: true, reward: this.challenge.reward };
    }
    
    return { completed: false, reward: null };
  }
  
  private save(): void {
    if (this.challenge) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.challenge));
    }
  }
}

export const dailyChallengeService = new DailyChallengeService();
