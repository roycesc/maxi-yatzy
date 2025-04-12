'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Dice from './dice'
import { Button } from '@/components/ui/button'
import { rollDice } from '@/lib/game/dice'
import { playSound, preloadAudio } from '@/lib/utils/audio'

// Animation duration constants to keep animation synchronized between components
export const DICE_ANIMATION_DURATION = 400; // Reduced from 500ms to 400ms for even snappier animation
export const DICE_ANIMATION_DELAY = 30; // Reduced from 50ms to 30ms for faster response

interface DiceContainerProps {
  onRoll: (dice: number[]) => void
  disabled?: boolean
  playerId?: string
  autoRollEnabled?: boolean
}

const DiceContainer: React.FC<DiceContainerProps> = ({
  onRoll,
  disabled = false,
  playerId,
  autoRollEnabled = false
}) => {
  const [dice, setDice] = useState<number[]>([])
  const [heldIndices, setHeldIndices] = useState<number[]>([])
  const [rollCount, setRollCount] = useState(0)
  const [isRolling, setIsRolling] = useState(false)
  
  // Keep track of the previous player ID
  const prevPlayerIdRef = useRef<string | undefined>(playerId)
  // Track if we should auto-roll for the next player change
  const shouldAutoRollNextTurn = useRef(autoRollEnabled)

  // Preload audio files on component mount
  useEffect(() => {
    preloadAudio(['diceRoll']);
  }, []);

  // Update the auto-roll flag for next turn whenever the setting changes
  useEffect(() => {
    shouldAutoRollNextTurn.current = autoRollEnabled;
    console.log(`Auto-roll for next turn set to: ${shouldAutoRollNextTurn.current}`);
  }, [autoRollEnabled]);

  // Log held indices for debugging
  useEffect(() => {
    console.log("Held dice indices:", heldIndices);
  }, [heldIndices]);

  // Log roll count for debugging
  useEffect(() => {
    console.log(`Current roll count: ${rollCount}`);
  }, [rollCount]);

  const handleRoll = useCallback(() => {
    console.log(`handleRoll called. Current rollCount: ${rollCount}, isRolling: ${isRolling}, disabled: ${disabled}`);
    
    // Players get exactly 3 rolls total (including auto-roll), so we allow rolling when count is 0, 1, or 2
    if (disabled || rollCount >= 3 || isRolling) {
      console.log(`Roll rejected: disabled=${disabled}, rollCount=${rollCount}, isRolling=${isRolling}`);
      return;
    }
    
    setIsRolling(true);
    
    // Play dice roll sound
    playSound('diceRoll', 0.4).catch(err => console.error('Error playing sound:', err));
    
    // Get the indices that are not held
    const indicesToRoll = Array.from({ length: 6 }, (_, i) => i).filter(
      index => !heldIndices.includes(index)
    );
    
    // Keep held dice, roll the rest
    const newDice = [...dice];
    const rolledValues = rollDice(indicesToRoll.length);
    
    indicesToRoll.forEach((diceIndex, i) => {
      newDice[diceIndex] = rolledValues[i];
    });
    
    // Fill in any empty slots if first roll
    if (dice.length === 0) {
      const rolledValues = rollDice(6);
      for (let i = 0; i < 6; i++) {
        newDice[i] = rolledValues[i];
      }
      // On first roll, no dice are held
      setHeldIndices([]);
    }
    
    // Simulate dice rolling animation
    // Allow extra time for animation to complete plus a small buffer
    const totalAnimationTime = DICE_ANIMATION_DURATION + DICE_ANIMATION_DELAY;
    
    setTimeout(() => {
      setDice(newDice);
      const newRollCount = rollCount + 1;
      console.log(`Updating roll count from ${rollCount} to ${newRollCount}`);
      setRollCount(newRollCount);
      setIsRolling(false);
      onRoll(newDice); // Send back to parent
    }, totalAnimationTime);
  }, [dice, disabled, heldIndices, isRolling, onRoll, rollCount]);

  // Handle auto roll or player change effects
  useEffect(() => {
    // When player changes, reset dice state
    if (playerId !== prevPlayerIdRef.current) {
      setDice([]);
      setRollCount(0);
      setHeldIndices([]);
      setIsRolling(false);
      
      // If auto roll is enabled, trigger a roll after player change
      if (autoRollEnabled && !disabled) {
        setTimeout(() => {
          handleRoll();
        }, 500); // Small delay for visual transition
      }
      
      // Update the previous player reference
      prevPlayerIdRef.current = playerId;
    }
  }, [playerId, disabled, handleRoll, autoRollEnabled]);

  // Add auto-roll for first turn
  useEffect(() => {
    // Auto-roll on first mount if enabled and roll count is 0
    if (autoRollEnabled && rollCount === 0 && !isRolling && !disabled) {
      console.log('Auto-rolling on first turn');
      // Small delay for component to fully initialize
      setTimeout(() => {
        handleRoll();
      }, 800);
    }
  }, [autoRollEnabled, rollCount, isRolling, disabled, handleRoll]);

  const toggleHold = (index: number) => {
    if (disabled || dice.length === 0 || rollCount === 0 || isRolling) return;
    
    setHeldIndices(prevHeld => {
      if (prevHeld.includes(index)) {
        return prevHeld.filter(i => i !== index);
      } else {
        return [...prevHeld, index];
      }
    });
  };

  // Allow rolling when roll count is less than 3
  const canRoll = !disabled && rollCount < 3 && !isRolling;
  
  // Generate button text based on roll state - simplified
  const getButtonText = () => {
    if (rollCount === 0) {
      return 'Roll 1/3';
    } else if (rollCount === 1) {
      return 'Roll 2/3';
    } else if (rollCount === 2) {
      return 'Roll 3/3';
    } else {
      return 'No Rolls Left';
    }
  };

  return (
    <div className="px-4 py-3">
      {/* Dice grid with improved spacing and shadow effects */}
      <div className="mb-3">
        <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex justify-center">
              <Dice
                key={`dice-${index}`}
                value={dice[index] || 0}
                isHeld={heldIndices.includes(index)}
                onToggleHold={() => toggleHold(index)}
                isRolling={isRolling}
                disabled={disabled || dice.length === 0 || rollCount === 0}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Roll Button with Apple-inspired styling */}
      <Button
        onClick={handleRoll}
        disabled={!canRoll}
        className={`w-full transition-all duration-200 leading-none font-medium tracking-tight h-11 rounded-xl shadow-sm max-w-sm mx-auto ${
          canRoll 
            ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white' 
            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
        }`}
      >
        {getButtonText()}
      </Button>
    </div>
  )
}

export default DiceContainer 