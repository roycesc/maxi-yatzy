'use client'

import React, { useState, useEffect } from 'react'
import Dice from './dice'
import { Button } from '@/components/ui/button'
import { rollDice } from '@/lib/game/dice'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

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
  const [autoRollEnabled, setAutoRollEnabled] = useState(false)

  // Log held indices for debugging
  useEffect(() => {
    console.log("Held dice indices:", heldIndices);
  }, [heldIndices]);

  // Log roll count for debugging
  useEffect(() => {
    console.log(`Current roll count: ${rollCount}`);
  }, [rollCount]);

  // Handle player change and initial auto-roll
  useEffect(() => {
    if (playerId) {
      console.log(`Player changed to ${playerId}, resetting dice`);
      setDice([]);
      setHeldIndices([]);
      setRollCount(0);
      
      // Auto-roll for first turn when player changes or when it's player 1's first turn
      // Only if autoRollEnabled is true
      if (!disabled && autoRollEnabled) {
        setTimeout(() => {
          console.log(`Auto-rolling for player ${playerId}`);
          handleRoll();
        }, 500); // Small delay for visual transition
      }
    }
  }, [playerId, disabled, autoRollEnabled]);

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
      console.log(`Updating roll count from ${rollCount} to ${newRollCount}`);
      setRollCount(newRollCount);
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
  
  return (
    <div className="flex flex-col">
      {/* Auto-roll toggle and status in one row */}
      <div className="flex items-center justify-between mb-1">
        <div className="text-amber-100 text-xs">
          {rollCount === 0 ? 'Ready to roll' : 
           rollCount < 3 ? `Roll ${rollCount}/3` : 
           'Select a score'}
        </div>
        <div className="flex items-center space-x-1">
          <Switch
            id="auto-roll"
            checked={autoRollEnabled}
            onCheckedChange={setAutoRollEnabled}
            className="scale-75" 
          />
          <Label htmlFor="auto-roll" className="text-amber-100 text-xs">
            Auto-roll
          </Label>
        </div>
      </div>
      
      {/* More compact dice grid */}
      <div className="grid grid-cols-6 gap-1 mb-2">
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
        className={`w-full py-1 text-sm ${
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