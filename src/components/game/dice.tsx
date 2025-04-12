'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DICE_ANIMATION_DURATION } from './dice-container'

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
  // State to track previous value for transitions
  const [prevValue, setPrevValue] = useState(value);
  // State to track the currently displayed value during animation
  const [displayValue, setDisplayValue] = useState(value);
  // Ref to store animation interval ID
  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update prevValue when value changes and animation completes
  useEffect(() => {
    if (!isRolling) {
      setPrevValue(value);
      setDisplayValue(value);
    }
  }, [value, isRolling]);

  // Effect to handle the rapid value changes during dice roll
  useEffect(() => {
    if (isRolling && !isHeld) {
      // Clear any existing interval
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
      }
      
      // Set up interval to change dice values rapidly
      rollIntervalRef.current = setInterval(() => {
        // Generate random value 1-6
        const randomValue = Math.floor(Math.random() * 6) + 1;
        setDisplayValue(randomValue);
      }, 60); // Update approximately every 60ms for a faster effect
      
      // Final value should match the actual result
      const timeoutDuration = DICE_ANIMATION_DURATION - 50;
      const finalTimeout = setTimeout(() => {
        if (rollIntervalRef.current) {
          clearInterval(rollIntervalRef.current);
          rollIntervalRef.current = null;
        }
        setDisplayValue(value);
      }, timeoutDuration);
      
      return () => {
        if (rollIntervalRef.current) {
          clearInterval(rollIntervalRef.current);
          rollIntervalRef.current = null;
        }
        clearTimeout(finalTimeout);
      };
    }
  }, [isRolling, isHeld, value]);

  // Define subtle dice shake animation
  const shakeAnimation = {
    initial: { 
      x: 0,
      y: 0,
      rotate: 0,
    },
    rolling: { 
      x: [0, -2, 2, -1, 0], // Very subtle horizontal movement
      y: [0, -1, 1, -1, 0], // Very subtle vertical movement
      rotate: [0, -1, 1, -0.5, 0], // Very subtle rotation
      transition: { 
        duration: DICE_ANIMATION_DURATION / 1000,
        times: [0, 0.25, 0.5, 0.75, 1],
        ease: "easeInOut",
      }
    },
    stopped: { 
      x: 0,
      y: 0,
      rotate: 0,
      transition: { 
        duration: 0.2,
      }
    }
  };

  const renderDots = () => {
    // Enhanced dot styling with improved visual appearance
    const dotColor = isHeld 
      ? "bg-blue-600 dark:bg-blue-500" 
      : "bg-black dark:bg-white";
    
    // Remove inner shadow for cleaner appearance
    const dotStyle = `w-2.5 h-2.5 rounded-full ${dotColor} flex-shrink-0`;
    
    // Function to create a dot with crisp appearance
    const createDot = () => (
      <div className={dotStyle} style={{ boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }} />
    );

    // Create patterns with better spacing
    switch (displayValue) {
      case 1:
        return <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${dotStyle} w-3 h-3`} />
        </div>
      case 2:
        return <div className="absolute inset-0 p-2.5">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-0">{createDot()}</div>
            <div className="absolute bottom-0 right-0">{createDot()}</div>
          </div>
        </div>
      case 3:
        return <div className="absolute inset-0 p-2.5">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-0">{createDot()}</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{createDot()}</div>
            <div className="absolute bottom-0 right-0">{createDot()}</div>
          </div>
        </div>
      case 4:
        return <div className="absolute inset-0 p-2.5">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-0">{createDot()}</div>
            <div className="absolute top-0 right-0">{createDot()}</div>
            <div className="absolute bottom-0 left-0">{createDot()}</div>
            <div className="absolute bottom-0 right-0">{createDot()}</div>
          </div>
        </div>
      case 5:
        return <div className="absolute inset-0 p-2.5">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-0">{createDot()}</div>
            <div className="absolute top-0 right-0">{createDot()}</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{createDot()}</div>
            <div className="absolute bottom-0 left-0">{createDot()}</div>
            <div className="absolute bottom-0 right-0">{createDot()}</div>
          </div>
        </div>
      case 6:
        return <div className="absolute inset-0 p-2.5">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-0">{createDot()}</div>
            <div className="absolute top-0 right-0">{createDot()}</div>
            <div className="absolute top-1/2 left-0 -translate-y-1/2">{createDot()}</div>
            <div className="absolute top-1/2 right-0 -translate-y-1/2">{createDot()}</div>
            <div className="absolute bottom-0 left-0">{createDot()}</div>
            <div className="absolute bottom-0 right-0">{createDot()}</div>
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

  // Determine animation state - don't animate the whole dice if held
  const animationState = isRolling && !isHeld ? "rolling" : "stopped";

  return (
    <div className="dice-perspective">
      <motion.div
        className={cn(
          "w-14 h-14 relative rounded-lg cursor-pointer transition-colors duration-200",
          "dice-3d", // Class for 3D styling
          isHeld 
            ? "bg-white dark:bg-blue-900/80 shadow-[0_0_0_1px_rgba(59,130,246,0.5),0_4px_6px_rgba(0,0,0,0.1)]" 
            : "bg-white dark:bg-zinc-800 shadow-[0_4px_6px_rgba(0,0,0,0.1)]",
          disabled ? "opacity-40 cursor-not-allowed" : "hover:brightness-95 active:scale-95",
          isRolling && !isHeld ? "cursor-wait" : ""
        )}
        onClick={handleClick}
        variants={shakeAnimation}
        initial="initial"
        animate={animationState}
        whileHover={!disabled && !isRolling ? { scale: 1.05 } : {}}
        whileTap={!disabled && !isRolling ? { scale: 0.95 } : {}}
        style={{
          // Simpler, crisper 3D effect
          boxShadow: isHeld 
            ? "0 4px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)" 
            : "0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* Using displayValue instead of value for dots rendering */}
        {displayValue > 0 && renderDots()}
        
        {/* Blinking effect during dice roll */}
        {isRolling && !isHeld && (
          <motion.div 
            className="absolute inset-0 bg-white/10 dark:bg-white/5 rounded-lg pointer-events-none"
            animate={{ 
              opacity: [0, 0.1, 0, 0.15, 0],
            }}
            transition={{ 
              repeat: DICE_ANIMATION_DURATION / 120,
              duration: 0.12,
            }}
          />
        )}
        
        {/* Enhanced shadow for 3D effect */}
        <div 
          className={cn(
            "absolute -z-10 inset-0 rounded-lg opacity-0 blur-md bg-black/30 transition-opacity duration-300",
            isRolling && !isHeld ? "opacity-40" : ""
          )} 
          style={{ 
            transform: "translateY(4px) scale(0.95)",
          }}
        />
        
        {/* Subtle edge highlight */}
        <div 
          className={cn(
            "absolute inset-0 rounded-lg pointer-events-none",
            "border border-gray-200 dark:border-white/10"
          )}
        />
      </motion.div>
    </div>
  )
}

export default Dice 