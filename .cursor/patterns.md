# Coding Patterns and Examples

## Component Patterns

### Server Component with Data Fetching
```typescript
// components/game-board.tsx
import { Suspense } from 'react';

export default async function GameBoard() {
  const gameData = await fetchGameData();
  
  return (
    <Suspense fallback={<GameLoading />}>
      <div className="game-board">
        {/* Game board content */}
      </div>
    </Suspense>
  );
}
```

### Client Component with State
```typescript
// components/dice-roller.tsx
'use client';

import { useState } from 'react';

export default function DiceRoller() {
  const [dice, setDice] = useState<number[]>([]);
  
  return (
    <div className="dice-roller">
      {/* Dice rolling UI */}
    </div>
  );
}
```

## API Route Patterns

### Protected API Route
```typescript
// app/api/game/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Handle request
}
```

## Database Patterns

### MongoDB Model
```typescript
// lib/models/game.ts
import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  scores: { type: Map, of: Number },
  currentTurn: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['waiting', 'active', 'completed'] }
});

export const Game = mongoose.models.Game || mongoose.model('Game', gameSchema);
```

## Utility Functions

### Game Logic
```typescript
// lib/utils/game.ts
export function calculateScore(dice: number[]): number {
  // Score calculation logic
}

export function validateMove(move: GameMove): boolean {
  // Move validation logic
}
```

## Type Definitions

### Game Types
```typescript
// types/game.ts
export interface GameState {
  id: string;
  players: Player[];
  scores: Record<string, number>;
  currentTurn: string;
  status: 'waiting' | 'active' | 'completed';
}

export interface Player {
  id: string;
  name: string;
  score: number;
}
```

## Error Handling

### Error Boundary
```typescript
// components/error-boundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
``` 