'use client'

import React from 'react'
import { useEffect } from 'react'

interface GameWrapperProps {
  children: React.ReactNode
}

export default function GameWrapper({ children }: GameWrapperProps) {
  // Apply styles on component mount and clean up on unmount
  useEffect(() => {
    // Create and inject a style element
    const styleEl = document.createElement('style')
    styleEl.textContent = `
      /* Hide the header in this route group */
      header {
        display: none !important;
      }
      
      /* Remove padding from main */
      main {
        padding: 0 !important;
        margin: 0 !important;
        max-width: none !important;
        width: 100% !important;
        height: 100vh !important;
        overflow: hidden !important;
      }
      
      /* Make sure body takes full height */
      body, html {
        height: 100% !important;
        overflow: hidden !important;
      }
    `
    document.head.appendChild(styleEl)
    
    // Clean up function to remove styles when component unmounts
    return () => {
      document.head.removeChild(styleEl)
    }
  }, [])
  
  return (
    <div className="game-wrapper relative w-full h-full">
      {children}
    </div>
  )
} 