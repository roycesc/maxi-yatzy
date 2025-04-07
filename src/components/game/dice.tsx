'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface DieProps {
  value: number
  index: number
  isHeld: boolean
  isRolling: boolean
  onClick: (index: number) => void
  disabled?: boolean
}

const dieVariants = {
  rolling: {
    rotateX: [0, 360, 720],
    rotateY: [0, 180, 360],
    transition: { duration: 0.7, ease: "easeOut" }
  },
  idle: {
    rotateX: 0,
    rotateY: 0
  }
}

const Die: React.FC<DieProps> = ({ 
  value, 
  index, 
  isHeld, 
  isRolling, 
  onClick, 
  disabled = false 
}) => {
  return (
    <motion.div
      className={cn(
        "w-16 h-16 rounded-lg shadow-md flex items-center justify-center cursor-pointer relative",
        "border-2 transition-colors transform-gpu perspective-500",
        isHeld ? "bg-amber-500 border-amber-600 text-white" : "bg-amber-100 border-amber-300 text-black",
        disabled ? "opacity-70 cursor-not-allowed" : "hover:scale-105",
      )}
      onClick={() => !disabled && onClick(index)}
      variants={dieVariants}
      animate={isRolling && !isHeld ? "rolling" : "idle"}
    >
      <div className="grid grid-cols-3 grid-rows-3 h-full w-full p-2">
        {/* Dots based on dice value */}
        {value === 1 && <div className="col-start-2 col-end-3 row-start-2 row-end-3 flex items-center justify-center">
          <Dot />
        </div>}
        
        {value === 2 && (
          <>
            <div className="col-start-1 col-end-2 row-start-1 row-end-2 flex items-center justify-center">
              <Dot />
            </div>
            <div className="col-start-3 col-end-4 row-start-3 row-end-4 flex items-center justify-center">
              <Dot />
            </div>
          </>
        )}
        
        {value === 3 && (
          <>
            <div className="col-start-1 col-end-2 row-start-1 row-end-2 flex items-center justify-center">
              <Dot />
            </div>
            <div className="col-start-2 col-end-3 row-start-2 row-end-3 flex items-center justify-center">
              <Dot />
            </div>
            <div className="col-start-3 col-end-4 row-start-3 row-end-4 flex items-center justify-center">
              <Dot />
            </div>
          </>
        )}
        
        {value === 4 && (
          <>
            <div className="col-start-1 col-end-2 row-start-1 row-end-2 flex items-center justify-center">
              <Dot />
            </div>
            <div className="col-start-3 col-end-4 row-start-1 row-end-2 flex items-center justify-center">
              <Dot />
            </div>
            <div className="col-start-1 col-end-2 row-start-3 row-end-4 flex items-center justify-center">
              <Dot />
            </div>
            <div className="col-start-3 col-end-4 row-start-3 row-end-4 flex items-center justify-center">
              <Dot />
            </div>
          </>
        )}
        
        {value === 5 && (
          <>
            <div className="col-start-1 col-end-2 row-start-1 row-end-2 flex items-center justify-center">
              <Dot />
            </div>
            <div className="col-start-3 col-end-4 row-start-1 row-end-2 flex items-center justify-center">
              <Dot />
            </div>
            <div className="col-start-2 col-end-3 row-start-2 row-end-3 flex items-center justify-center">
              <Dot />
            </div>
            <div className="col-start-1 col-end-2 row-start-3 row-end-4 flex items-center justify-center">
              <Dot />
            </div>
            <div className="col-start-3 col-end-4 row-start-3 row-end-4 flex items-center justify-center">
              <Dot />
            </div>
          </>
        )}
        
        {value === 6 && (
          <>
            <div className="col-start-1 col-end-2 row-start-1 row-end-2 flex items-center justify-center">
              <Dot />
            </div>
            <div className="col-start-3 col-end-4 row-start-1 row-end-2 flex items-center justify-center">
              <Dot />
            </div>
            <div className="col-start-1 col-end-2 row-start-2 row-end-3 flex items-center justify-center">
              <Dot />
            </div>
            <div className="col-start-3 col-end-4 row-start-2 row-end-3 flex items-center justify-center">
              <Dot />
            </div>
            <div className="col-start-1 col-end-2 row-start-3 row-end-4 flex items-center justify-center">
              <Dot />
            </div>
            <div className="col-start-3 col-end-4 row-start-3 row-end-4 flex items-center justify-center">
              <Dot />
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

const Dot: React.FC = () => (
  <div className="rounded-full bg-amber-950 w-2 h-2 md:w-3 md:h-3"></div>
)

export default Die 