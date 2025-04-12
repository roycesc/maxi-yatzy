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
      header, footer {
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
        background: linear-gradient(to bottom, rgba(74, 144, 226, 0.1), rgba(255, 149, 0, 0.05)) !important;
      }
      
      /* Make sure body takes full height */
      body, html {
        height: 100% !important;
        overflow: hidden !important;
      }
      
      /* Nintendo-like styling for toasts */
      [data-sonner-toast] {
        border: 2px solid #4A90E2 !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      }
    `
    document.head.appendChild(styleEl)
    
    // Clean up function to remove styles when component unmounts
    return () => {
      document.head.removeChild(styleEl)
    }
  }, [])
  
  return (
    <div className="game-wrapper relative w-full h-full font-sans">
      {children}
    </div>
  )
} 