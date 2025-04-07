'use client'

import React, { useState, useEffect } from 'react'
import Die from './dice'
import { rollDice, rerollDice } from '@/lib/game/dice'
import { Button } from '@/components/ui/button'

interface DiceContainerProps {
  onRoll?: (dice: number[]) => void
  disabled?: boolean
  maxRolls?: number
  playerId?: string
}

const DiceContainer: React.FC<DiceContainerProps> = ({ 
  onRoll,
  disabled = false,
  maxRolls = 3,
  playerId
}) => {
  const [dice, setDice] = useState<number[]>([])
  const [heldIndices, setHeldIndices] = useState<number[]>([])
  const [isRolling, setIsRolling] = useState(false)
  const [rollsRemaining, setRollsRemaining] = useState(maxRolls)
  const [hasRolled, setHasRolled] = useState(false)
  
  useEffect(() => {
    if (playerId) {
      setDice([])
      setHeldIndices([])
      setRollsRemaining(maxRolls)
      setHasRolled(false)
      setIsRolling(false)
    }
  }, [playerId, maxRolls])

  useEffect(() => {
    if (!hasRolled && !disabled) {
      rollDiceHandler()
    }
  }, [disabled, hasRolled])

  const toggleHoldDie = (index: number) => {
    if (!hasRolled || disabled || isRolling) return

    setHeldIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }

  const rollDiceHandler = () => {
    if (disabled || isRolling || rollsRemaining <= 0) return

    setIsRolling(true)
    
    setTimeout(() => {
      let newDice: number[]
      
      if (!hasRolled) {
        newDice = rollDice(6)
        setHasRolled(true)
      } else {
        newDice = rerollDice(dice, heldIndices)
      }
      
      setDice(newDice)
      setRollsRemaining(prev => prev - 1)
      
      if (onRoll) {
        onRoll(newDice)
      }
      
      setTimeout(() => {
        setIsRolling(false)
      }, 700)
    }, 50)
  }

  const resetDice = () => {
    setDice([])
    setHeldIndices([])
    setRollsRemaining(maxRolls)
    setHasRolled(false)
    setIsRolling(false)
  }

  console.log('Dice container for player:', playerId, 'Held dice indices:', heldIndices);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-green-800 p-4 rounded-lg w-full">
        <div className="flex justify-center items-center gap-2 flex-wrap">
          {dice.length === 0 ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={index}
                className="w-16 h-16 rounded-lg bg-gray-300/20 border-2 border-gray-300/30"
              />
            ))
          ) : (
            dice.map((value, index) => (
              <Die
                key={index}
                value={value}
                index={index}
                isHeld={heldIndices.includes(index)}
                isRolling={isRolling}
                onClick={toggleHoldDie}
                disabled={disabled || rollsRemaining === 0}
              />
            ))
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          onClick={rollDiceHandler}
          disabled={disabled || isRolling || rollsRemaining === 0}
          className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-6 py-3 rounded-full shadow-md"
        >
          {rollsRemaining === maxRolls ? 'Roll Dice' : `Roll Again (${rollsRemaining})`}
        </Button>
        
        {hasRolled && (
          <div className="text-sm font-medium bg-amber-100 px-3 py-1 rounded-full">
            Rolls: {maxRolls - rollsRemaining}/{maxRolls}
          </div>
        )}
      </div>
    </div>
  )
}

export default DiceContainer 