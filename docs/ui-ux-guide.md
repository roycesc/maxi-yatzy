# UI/UX Design Guide

## Design Principles

### Nintendo-like Feel
- **Playful & Inviting:** Bright, cheerful color palette
- **Clear & Readable:** High contrast, legible typography
- **Responsive Feedback:** Immediate visual and audio feedback
- **Smooth Animations:** Fluid transitions and movements
- **Consistent Styling:** Unified design language throughout

### Mobile-First Approach
- **Touch-Friendly:** Large, well-spaced touch targets
- **Adaptive Layout:** Responsive design for all screen sizes
- **Performance Focus:** Optimized assets and animations
- **Clear Hierarchy:** Important elements prominently displayed
- **Simplified Navigation:** Easy access to key features

## Color Palette

### Primary Colors
- **Main Blue:** `#4A90E2` (Primary action, buttons)
- **Accent Orange:** `#FF9500` (Highlights, important elements)
- **Background:** `#F5F5F5` (Light mode), `#1A1A1A` (Dark mode)

### Secondary Colors
- **Success Green:** `#4CAF50`
- **Warning Yellow:** `#FFC107`
- **Error Red:** `#F44336`
- **Neutral Gray:** `#757575`

## Typography

### Font Family
- **Primary:** Inter (Clean, modern, highly readable)
- **Secondary:** Nunito (Playful, friendly)

### Font Sizes
- **Heading 1:** 2.5rem (Mobile), 3rem (Desktop)
- **Heading 2:** 2rem (Mobile), 2.5rem (Desktop)
- **Body:** 1rem (Mobile), 1.125rem (Desktop)
- **Small Text:** 0.875rem

## Component Design

### Dice
- **Size:** 48px (Mobile), 64px (Desktop)
- **Animation:** Smooth roll with 3D effect
- **Selection:** Clear visual feedback when held
- **State Colors:**
  - Default: White with black dots
  - Held: Primary blue with white dots
  - Disabled: Light gray

### Score Sheet
- **Layout:** Scrollable on mobile, fixed on desktop
- **Categories:** Clear section headers
- **Input Fields:** Large touch targets
- **Score Preview:** Highlight potential scores
- **Completed Scores:** Distinct styling

### Buttons
- **Primary CTA:** Large, prominent, fixed position on mobile
- **Secondary Actions:** Clear but less prominent
- **Touch Targets:** Minimum 44px height
- **States:** Hover, active, disabled styles
- **Feedback:** Subtle animation on press

## Animations

### Dice Roll
```typescript
const rollAnimation = {
  initial: { rotateX: 0, rotateY: 0 },
  animate: { 
    rotateX: [0, 360, 720],
    rotateY: [0, 180, 360],
    transition: { duration: 1, ease: "easeOut" }
  }
};
```

### Score Update
```typescript
const scoreAnimation = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.2, 1],
    transition: { duration: 0.3 }
  }
};
```

## Sound Design

### Core Sound Effects
- **Dice Roll:** Short, satisfying roll sound
- **Score Update:** Pleasant chime
- **Button Press:** Subtle click
- **Error:** Soft warning tone
- **Victory:** Celebratory fanfare

### Sound Implementation
```typescript
// lib/sounds.ts
export const playSound = (sound: GameSound) => {
  const audio = new Audio(`/sounds/${sound}.mp3`);
  audio.volume = 0.5;
  audio.play();
};
```

## Responsive Design

### Breakpoints
```css
/* tailwind.config.js */
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    }
  }
}
```

### Layout Examples
```tsx
// Mobile-first layout
<div className="flex flex-col space-y-4 p-4">
  <div className="flex justify-center">
    <DiceRoller />
  </div>
  <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg">
    <PrimaryButton />
  </div>
</div>
```

## Accessibility

### Key Considerations
- **Color Contrast:** WCAG 2.1 AA compliance
- **Keyboard Navigation:** Full keyboard support
- **Screen Readers:** ARIA labels and roles
- **Focus States:** Visible focus indicators
- **Reduced Motion:** Respect user preferences

### Implementation
```tsx
// components/accessible-button.tsx
export const AccessibleButton = ({ children, ...props }) => (
  <button
    className="focus:outline-none focus:ring-2 focus:ring-primary-500"
    role="button"
    aria-label={props['aria-label']}
    {...props}
  >
    {children}
  </button>
);
``` 