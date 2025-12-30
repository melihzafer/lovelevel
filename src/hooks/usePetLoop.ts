import { useEffect, useRef } from 'react';
import { usePetStore } from '../store';

const DECAY_INTERVAL = 60000; // 1 minute
const HYGIENE_DECAY = 0.2; // -0.2 hygiene per minute (500 mins to 0)
const HUNGER_DECAY = 0.7; // -0.5 hunger per minute (200 mins to 0)
const ENERGY_DECAY = 0.7; // -0.5 energy per minute (200 mins to 0)

export const usePetLoop = () => {
  const updatePet = usePetStore(state => state.updatePet);
  const hunger = usePetStore(state => state.hunger);
  const hygiene = usePetStore(state => state.hygiene);
  const energy = usePetStore(state => state.energy);
  
  // Refs to access latest state inside interval
  const statsRef = useRef({ hunger, hygiene, energy });

  useEffect(() => {
    statsRef.current = { hunger, hygiene, energy };
  }, [hunger, hygiene, energy]);

  useEffect(() => {
    const interval = setInterval(() => {
      const { hunger, hygiene, energy } = statsRef.current;
      
      const updates: any = {};
      let hasUpdates = false;

      // Decay Hygiene
      if (isNaN(hygiene)) {
        updates.hygiene = 100;
        hasUpdates = true;
      } else if (hygiene > 0) {
        updates.hygiene = Math.max(0, hygiene - HYGIENE_DECAY);
        hasUpdates = true;
      }

      // Decay Hunger
      if (isNaN(hunger)) {
        updates.hunger = 50;
        hasUpdates = true;
      } else if (hunger > 0) {
        updates.hunger = Math.max(0, hunger - HUNGER_DECAY);
        hasUpdates = true;
      }

      // Decay Energy
      if (isNaN(energy)) {
        updates.energy = 100;
        hasUpdates = true;
      } else if (energy > 0) {
        updates.energy = Math.max(0, energy - ENERGY_DECAY);
        hasUpdates = true;
      }

      if (hasUpdates) {
        updatePet(updates);
      }
    }, DECAY_INTERVAL);

    return () => clearInterval(interval);
  }, [updatePet]);
};
