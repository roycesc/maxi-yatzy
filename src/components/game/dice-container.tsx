'use client'

import React, { useState, useEffect, useRef } from 'react'
import Dice from './dice'
import { Button } from '@/components/ui/button'
import { rollDice } from '@/lib/game/dice'

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
  
  // Track the current turn player to know when a turn changes
  const prevPlayerIdRef = useRef<string | undefined>(playerId)
  // Track if we should auto-roll for the next player change
  const shouldAutoRollNextTurn = useRef(autoRollEnabled)

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

  // Handle player change 
  useEffect(() => {
    // Check if player has actually changed (new turn)
    if (playerId !== prevPlayerIdRef.current) {
      console.log(`Player changed from ${prevPlayerIdRef.current} to ${playerId}, resetting dice`);
      setDice([]);
      setHeldIndices([]);
      setRollCount(0);
      
      // Auto-roll only if it was enabled before this turn started
      if (!disabled && shouldAutoRollNextTurn.current) {
        setTimeout(() => {
          console.log(`Auto-rolling for player ${playerId} (new turn)`);
          handleRoll();
        }, 500); // Small delay for visual transition
      }
      
      // Update the previous player reference
      prevPlayerIdRef.current = playerId;
    }
  }, [playerId, disabled]);

  const handleRoll = () => {
    console.log(`handleRoll called. Current rollCount: ${rollCount}, isRolling: ${isRolling}, disabled: ${disabled}`);
    
    // Players get exactly 3 rolls total (including auto-roll), so we allow rolling when count is 0, 1, or 2
    if (disabled || rollCount >= 3 || isRolling) {
      console.log(`Roll rejected: disabled=${disabled}, rollCount=${rollCount}, isRolling=${isRolling}`);
      return;
    }
    
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
      const newRollCount = rollCount + 1;
      console.log(`Incrementing roll count. Current rollCount: ${rollCount}`);
      setRollCount(prev => prev + 1);
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
    <div className="flex flex-col">
      {/* Dice grid - evenly spaced, visually balanced */}
      <div className="flex justify-center items-center mb-3">
        <div className="grid grid-cols-6 gap-2 max-w-md w-full px-2">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex justify-center">
              <Dice
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
      
      {/* Roll Button - positioned at the bottom */}
      <Button
        onClick={handleRoll}
        disabled={!canRoll}
        className={`w-full py-2 text-base ${
          canRoll 
            ? 'bg-amber-500 hover:bg-amber-600' 
            : 'bg-gray-400'
        } text-white font-medium h-12 rounded-lg shadow-md max-w-sm mx-auto`}
      >
        {getButtonText()}
      </Button>
    </div>
  )
}

export default DiceContainer 