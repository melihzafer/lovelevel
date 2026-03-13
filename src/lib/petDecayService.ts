/**
 * Pet Decay Service
 * Calculates and applies stat decay based on elapsed time since last visit
 * This ensures the pet's stats decay even when the app is closed
 */

import * as db from './db';
import type { PetState } from '../types/database';

// Decay rates per minute
const HYGIENE_DECAY_PER_MINUTE = 0.2; // -0.2 hygiene per minute (500 mins = ~8.3 hours to 0)
const HUNGER_DECAY_PER_MINUTE = 0.7; // -0.7 hunger per minute (~143 mins = ~2.4 hours to 0)
const ENERGY_DECAY_PER_MINUTE = 0.5; // -0.5 energy per minute (~200 mins = ~3.3 hours to 0)

// Maximum decay time to calculate (cap at 24 hours to prevent pet from dying completely)
const MAX_DECAY_MINUTES = 24 * 60; // 1440 minutes

/**
 * Calculate and apply decay based on time elapsed since last decay
 * Should be called when the app loads
 */
export async function calculateAndApplyDecay(): Promise<{
  minutesElapsed: number;
  decayApplied: {
    hunger: number;
    hygiene: number;
    energy: number;
  };
  newStats: {
    hunger: number;
    hygiene: number;
    energy: number;
  };
}> {
  const pet = await db.getPet();
  
  // Get last decay time, default to now if not set
  const lastDecayTime = pet.lastDecayTime 
    ? new Date(pet.lastDecayTime) 
    : new Date();
  
  const now = new Date();
  const minutesElapsed = Math.min(
    Math.floor((now.getTime() - lastDecayTime.getTime()) / (1000 * 60)),
    MAX_DECAY_MINUTES
  );
  
  // If less than a minute has passed, no decay needed
  if (minutesElapsed < 1) {
    return {
      minutesElapsed: 0,
      decayApplied: { hunger: 0, hygiene: 0, energy: 0 },
      newStats: {
        hunger: pet.hunger,
        hygiene: pet.hygiene,
        energy: pet.energy,
      },
    };
  }
  
  // Calculate decay
  const hungerDecay = HUNGER_DECAY_PER_MINUTE * minutesElapsed;
  const hygieneDecay = HYGIENE_DECAY_PER_MINUTE * minutesElapsed;
  const energyDecay = ENERGY_DECAY_PER_MINUTE * minutesElapsed;
  
  // Apply decay (clamp to 0-100)
  const newHunger = Math.max(0, Math.min(100, pet.hunger - hungerDecay));
  const newHygiene = Math.max(0, Math.min(100, pet.hygiene - hygieneDecay));
  const newEnergy = Math.max(0, Math.min(100, pet.energy - energyDecay));
  
  // Determine mood based on stats
  let newMood = pet.mood;
  if (newHunger < 20 || newHygiene < 20) {
    newMood = 'sleepy';
  } else if (newHunger > 50 && newHygiene > 50) {
    newMood = 'happy';
  } else {
    newMood = 'chill';
  }
  
  // Update pet in database
  await db.updatePet({
    hunger: newHunger,
    hygiene: newHygiene,
    energy: newEnergy,
    mood: newMood,
    lastDecayTime: now.toISOString(),
  });
  
  console.log(`[Decay] Applied ${minutesElapsed} minutes of decay:`, {
    hunger: `-${hungerDecay.toFixed(1)} (${pet.hunger.toFixed(1)} → ${newHunger.toFixed(1)})`,
    hygiene: `-${hygieneDecay.toFixed(1)} (${pet.hygiene.toFixed(1)} → ${newHygiene.toFixed(1)})`,
    energy: `-${energyDecay.toFixed(1)} (${pet.energy.toFixed(1)} → ${newEnergy.toFixed(1)})`,
  });
  
  return {
    minutesElapsed,
    decayApplied: {
      hunger: hungerDecay,
      hygiene: hygieneDecay,
      energy: energyDecay,
    },
    newStats: {
      hunger: newHunger,
      hygiene: newHygiene,
      energy: newEnergy,
    },
  };
}

/**
 * Update the last decay time to now
 * Should be called periodically while the app is open
 */
export async function updateLastDecayTime(): Promise<void> {
  await db.updatePet({
    lastDecayTime: new Date().toISOString(),
  });
}

/**
 * Get time since last decay in minutes
 */
export function getTimeSinceLastDecay(pet: PetState): number {
  if (!pet.lastDecayTime) return 0;
  
  const lastDecayTime = new Date(pet.lastDecayTime);
  const now = new Date();
  
  return Math.floor((now.getTime() - lastDecayTime.getTime()) / (1000 * 60));
}
