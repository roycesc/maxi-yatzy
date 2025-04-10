'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface DiceProps {
  value: number
  isHeld?: boolean
  isRolling?: boolean
  disabled?: boolean
  onToggleHold?: () => void
}

const Dice: React.FC<DiceProps> = ({ 
  value, 
  isHeld = false, 
  isRolling = false,
  disabled = false,
  onToggleHold
}) => {
  // Define animation variants for dice rolling
  const rollAnimation = {
    initial: { rotateX: 0, rotateY: 0 },
    rolling: { 
      rotateX: [0, 360, 720], 
      rotateY: [0, 360, 720],
      transition: { 
        duration: 0.8,
        ease: "easeInOut" 
      }
    },
    stopped: { 
      rotateX: 0, 
      rotateY: 0,
      transition: { 
        duration: 0.2 
      }
    }
  }

  // Generate dots for dice face
  const renderDots = () => {
    switch(value) {
      case 1:
        return <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-900"></div>
        </div>
      case 2:
        return <div className="absolute inset-0 grid grid-cols-2 p-2">
          <div className="flex items-start justify-start">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
          <div className="flex items-end justify-end">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
        </div>
      case 3:
        return <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-2">
          <div className="flex items-start justify-start col-start-1 row-start-1">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
          <div className="flex items-center justify-center col-start-2 row-start-2">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
          <div className="flex items-end justify-end col-start-3 row-start-3">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
        </div>
      case 4:
        return <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-2">
          <div className="flex items-start justify-start">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
          <div className="flex items-start justify-end">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
          <div className="flex items-end justify-start">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
          <div className="flex items-end justify-end">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
        </div>
      case 5:
        return <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-2">
          <div className="flex items-start justify-start col-start-1 row-start-1">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
          <div className="flex items-start justify-end col-start-3 row-start-1">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
          <div className="flex items-center justify-center col-start-2 row-start-2">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
          <div className="flex items-end justify-start col-start-1 row-start-3">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
          <div className="flex items-end justify-end col-start-3 row-start-3">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
        </div>
      case 6:
        return <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-2">
          <div className="flex items-start justify-start col-start-1 row-start-1">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
          <div className="flex items-center justify-start col-start-1 row-start-2">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
          <div className="flex items-end justify-start col-start-1 row-start-3">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
          <div className="flex items-start justify-end col-start-3 row-start-1">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
          <div className="flex items-center justify-end col-start-3 row-start-2">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
          <div className="flex items-end justify-end col-start-3 row-start-3">
            <div className="w-2 h-2 rounded-full bg-amber-900"></div>
          </div>
        </div>
      default:
        return null
    }
  }

  const handleClick = () => {
    if (!disabled && !isRolling && onToggleHold) {
      onToggleHold();
    }
  };

  return (
    <motion.div
      className={cn(
        "w-16 h-16 relative rounded-lg shadow-md cursor-pointer transition-colors",
        isHeld ? "bg-amber-400 border-2 border-amber-600" : "bg-white",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:brightness-95",
        isRolling ? "cursor-wait" : ""
      )}
      onClick={handleClick}
      variants={rollAnimation}
      initial="initial"
      animate={isRolling ? "rolling" : "stopped"}
    >
      {value > 0 && renderDots()}
    </motion.div>
  )
}

export default Dice 