'use client'

import React, { useState, useEffect } from 'react'
import Dice from './dice'
import { Button } from '@/components/ui/button'
import { rollDice } from '@/lib/game/dice'

interface DiceContainerProps {
  onRoll: (dice: number[]) => void
  disabled?: boolean
  playerId?: string
}

const DiceContainer: React.FC<DiceContainerProps> = ({
  onRoll,
  disabled = false,
  playerId
}) => {
  const [dice, setDice] = useState<number[]>([])
  const [heldIndices, setHeldIndices] = useState<number[]>([])
  const [rollCount, setRollCount] = useState(0)
  const [isRolling, setIsRolling] = useState(false)

  // Log held indices for debugging
  useEffect(() => {
    console.log("Held dice indices:", heldIndices);
  }, [heldIndices]);

  // Handle player change - reset everything
  useEffect(() => {
    if (playerId) {
      console.log(`Player changed to ${playerId}, resetting dice`);
      setDice([]);
      setHeldIndices([]);
      setRollCount(0);
      
      // Auto-roll for first turn when player changes
      if (!disabled) {
        setTimeout(() => {
          handleRoll();
        }, 500); // Small delay for visual transition
      }
    }
  }, [playerId, disabled]);

  // Initial auto-roll for first player on component mount
  useEffect(() => {
    if (dice.length === 0 && !disabled && playerId === '1') {
      console.log("Initial auto-roll for first player");
      setTimeout(() => {
        handleRoll();
      }, 500);
    }
  }, [disabled]);

  const handleRoll = () => {
    if (disabled || rollCount >= 3 || isRolling) return;
    
    setIsRolling(true);
    
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
    }
    
    // Simulate dice rolling animation
    setTimeout(() => {
      setDice(newDice);
      setRollCount(prevCount => prevCount + 1);
      setIsRolling(false);
      onRoll(newDice); // Send back to parent
    }, 600);
  };

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

  const canRoll = !disabled && rollCount < 3 && !isRolling;
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-amber-100 mb-2 text-center">
        {rollCount === 0 ? 'Ready to roll!' : 
         rollCount < 3 ? `Roll ${rollCount}/3 complete` : 
         'All rolls used - select a score'}
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[...Array(6)].map((_, index) => (
          <Dice
            key={index}
            value={dice[index] || 0}
            isHeld={heldIndices.includes(index)}
            onToggleHold={() => toggleHold(index)}
            isRolling={isRolling}
            disabled={disabled || dice.length === 0 || rollCount === 0}
          />
        ))}
      </div>
      
      <Button
        onClick={handleRoll}
        disabled={!canRoll}
        className={`w-full py-2 ${
          canRoll 
            ? 'bg-amber-500 hover:bg-amber-600' 
            : 'bg-gray-400'
        } text-white font-medium`}
      >
        {rollCount === 0 ? 'Roll Dice' : 
         rollCount < 3 ? 'Roll Again' : 
         'No Rolls Left'}
      </Button>
    </div>
  )
}

export default DiceContainer 