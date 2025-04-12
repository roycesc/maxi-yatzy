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
  // Define animation variants for dice rolling with more refined animation
  const rollAnimation = {
    initial: { rotateX: 0, rotateY: 0, scale: 1 },
    rolling: { 
      rotateX: [0, 360, 720], 
      rotateY: [0, 360, 720],
      scale: [1, 1.05, 1],
      transition: { 
        duration: 0.9,
        ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
      }
    },
    stopped: { 
      rotateX: 0, 
      rotateY: 0,
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  // Generate dots for dice face with improved styling
  const renderDots = () => {
    // Using dot colors that match Apple's aesthetic
    const dotColor = "bg-blue-600/90 dark:bg-blue-400/90";
    const dotShadow = "shadow-[0_0_1px_rgba(0,0,0,0.1)]";
    
    switch(value) {
      case 1:
        return <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor} ${dotShadow}`}></div>
        </div>
      case 2:
        return <div className="absolute inset-0 grid grid-cols-2 p-2">
          <div className="flex items-start justify-start">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
          <div className="flex items-end justify-end">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
        </div>
      case 3:
        return <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-2">
          <div className="flex items-start justify-start col-start-1 row-start-1">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
          <div className="flex items-center justify-center col-start-2 row-start-2">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
          <div className="flex items-end justify-end col-start-3 row-start-3">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
        </div>
      case 4:
        return <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-2">
          <div className="flex items-start justify-start">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
          <div className="flex items-start justify-end">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
          <div className="flex items-end justify-start">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
          <div className="flex items-end justify-end">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
        </div>
      case 5:
        return <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-2">
          <div className="flex items-start justify-start col-start-1 row-start-1">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
          <div className="flex items-start justify-end col-start-3 row-start-1">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
          <div className="flex items-center justify-center col-start-2 row-start-2">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
          <div className="flex items-end justify-start col-start-1 row-start-3">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
          <div className="flex items-end justify-end col-start-3 row-start-3">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
        </div>
      case 6:
        return <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-2">
          <div className="flex items-start justify-start col-start-1 row-start-1">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
          <div className="flex items-center justify-start col-start-1 row-start-2">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
          <div className="flex items-end justify-start col-start-1 row-start-3">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
          <div className="flex items-start justify-end col-start-3 row-start-1">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
          <div className="flex items-center justify-end col-start-3 row-start-2">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
          </div>
          <div className="flex items-end justify-end col-start-3 row-start-3">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${dotShadow}`}></div>
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

  // Determine animation state - don't animate if the die is held
  const animationState = isRolling && !isHeld ? "rolling" : "stopped";

  return (
    <motion.div
      className={cn(
        "w-11 h-11 relative rounded-xl cursor-pointer transition-all duration-200",
        isHeld 
          ? "bg-gradient-to-b from-blue-100 to-white dark:from-blue-900/40 dark:to-blue-800/20 shadow-[0_0_0_1px_rgba(59,130,246,0.5),0_2px_4px_0_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.5)]" 
          : "bg-white dark:bg-zinc-800 shadow-[0_2px_4px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.6)]",
        disabled ? "opacity-40 cursor-not-allowed" : "hover:brightness-95 active:scale-95",
        isRolling && !isHeld ? "cursor-wait" : ""
      )}
      onClick={handleClick}
      variants={rollAnimation}
      initial="initial"
      animate={animationState}
      whileHover={!disabled && !isRolling ? { scale: 1.05 } : {}}
      whileTap={!disabled && !isRolling ? { scale: 0.95 } : {}}
    >
      {value > 0 && renderDots()}
    </motion.div>
  )
}

export default Dice 