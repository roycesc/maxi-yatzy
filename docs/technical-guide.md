# Technical Implementation Guide

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication routes
│   ├── (game)/            # Game routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── game/             # Game-specific components
│   ├── ui/               # UI components
│   └── layout/           # Layout components
├── lib/                  # Utility functions and shared logic
│   ├── auth/             # Authentication utilities
│   ├── db/               # Database utilities
│   ├── game/             # Game logic utilities
│   └── utils/            # General utilities
├── types/                # TypeScript type definitions
└── styles/              # Global styles
```

## Game Logic Utilities (`src/lib/game/`)

This directory contains the core, reusable logic for the Maxi Yatzy game mechanics, independent of the UI or specific API endpoints.

### `dice.ts`
- `rollDice(numDice = 6): number[]`: Simulates rolling a specified number of dice (defaults to 6). Returns an array of dice values.
- `rerollDice(currentDice: number[], heldIndices: number[]): number[]`: Takes the current dice and an array of indices for dice to keep ('held'). Returns a new array where the non-held dice have been rerolled.

### `scoring.ts`
- Contains functions to calculate scores for all Maxi Yatzy categories based on an array of 6 dice values.
- `calculateSingles(dice: number[], value: number): number`: Calculates score for Ones, Twos, etc.
- `calculateNOfAKind(dice: number[], requiredCount: number): number`: Calculates score for One Pair, Three of a Kind, Four of a Kind (finds the highest value combination).
- `calculateTwoPairs(dice: number[]): number`: Calculates score for Two Pairs.
- `calculateSmallStraight(dice: number[]): number`: Checks for 1-2-3-4-5 sequence (scores 15).
- `calculateLargeStraight(dice: number[]): number`: Checks for 2-3-4-5-6 sequence (scores 20).
- `calculateFullHouse(dice: number[]): number`: Checks for three of one kind and two of another (scores sum of all dice).
- `calculateYatzy(dice: number[]): number`: Checks for five of a kind (scores 50).
- `calculateChance(dice: number[]): number`: Calculates sum of all dice.
- `calculatePotentialScores(dice: number[]): Record<string, number>`: Returns an object mapping all category names to their potential scores for the given dice roll (doesn't account for already used categories).
- `calculateUpperSectionBonus(upperScores: Record<string, number | null>): number`: Calculates the 50 point bonus if the sum of filled upper section scores is >= 63.

### Turn Progression Logic
- Logic related to tracking the number of rolls remaining in a turn is *not* housed here. This stateful logic belongs within the game state management layer (e.g., API routes/Server Actions modifying database state).

## Component Patterns

### Server Components
```typescript
// components/game/game-board.tsx
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

### Client Components
```typescript
// components/game/dice-roller.tsx
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

## State Management

### Server State
- Use React Server Components for data fetching
- Implement proper loading states
- Handle errors gracefully

### Client State
- Use React Context for global state
- Implement optimistic updates
- Handle real-time updates

## API Routes

### Protected Routes
```typescript
// app/api/game/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  console.log('Authorized user:', session.user.email);

  // Handle request
}
```

## Database

- **Provider**: Neon Serverless Postgres ([neon.tech](https://neon.tech/))
- **ORM**: Prisma ([prisma.io](https://www.prisma.io/))
- **Connection**: Pooled connection string required, especially for serverless deployment.
- **Schema Definition**: See `prisma/schema.prisma` (Note: `email` is now the primary required identifier for login).
- **Migrations**: Managed via `prisma migrate dev` (using `npm run db:migrate`).
- **Local Setup**: Requires `DATABASE_URL` in `.env` pointing to the Neon pooled connection string.
- **Production Setup (Vercel)**: Handled via the Vercel Neon Integration, automatically injecting `POSTGRES_PRISMA_URL`.

```typescript
// lib/db/prisma.ts - Singleton Client Setup
import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  // Optionally log database queries
  // log: ['query'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
```

## Authentication Validation (`src/lib/validation/auth.ts`)

- Uses `zod` to define schemas for validating user input related to authentication.
- **`loginSchema`**: Validates `email` (must be a valid email format) and `password` (must be present and non-empty).
- **`registerSchema`**: Validates `email` (valid format), `password` (minimum 8 characters), and optionally `username` (must be a string if provided).

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

## Testing

- **Framework**: Jest is configured as the primary testing framework.
- **Configuration**: 
    - `jest.config.ts`: Configures Jest to use `ts-jest` for TypeScript, handle path aliases (`@/*`), set up the `jsdom` environment, and specifies `testMatch` patterns to find test files.
    - `jest.setup.ts`: Imports `@testing-library/jest-dom` to provide custom DOM element matchers.
- **Test Runner**: Tests are executed via the `npm test` script (which runs `jest --watch` by default).
- **Structure**: Test files are located within the `__tests__` directory, mirroring the structure of the `src` directory where possible (e.g., `__tests__/lib/game/` for tests of `src/lib/game/`).
- **Current Tests**:
    - `__tests__/lib/game/dice.test.ts`: Unit tests for dice rolling and rerolling logic.
    - `__tests__/lib/game/scoring.test.ts`: Unit tests for all game scoring calculation functions.
    - `__tests__/auth.test.ts`: Unit tests for the Zod schemas in `src/lib/validation/auth.ts`.

### Component Tests (Example Structure)
```typescript
// __tests__/components/game-board.test.tsx
import { render, screen } from '@testing-library/react';
import GameBoard from '@/components/game/game-board';

describe('GameBoard', () => {
  it('renders game board correctly', () => {
    render(<GameBoard />);
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
  });
});
```

### API Tests
```typescript
// __tests__/api/game.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/game/route';

describe('Game API', () => {
  it('handles game creation', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { /* test data */ }
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});
```

## Deployment

- **Platform**: Vercel ([vercel.com](https://vercel.com/))
- **Database**: Neon Serverless Postgres integrated via Vercel Integrations.
- **Environment Variables**:
    - **Local (`.env`)**: `DATABASE_URL` (Neon pooled connection string), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
    - **Vercel (Production/Preview)**: `NEXTAUTH_SECRET`, `NEXTAUTH_URL` must be set manually in Vercel project settings. Database connection (`POSTGRES_PRISMA_URL`) is handled automatically by the Neon integration.
- **Build Command**: `npm run build` (or handled automatically by Vercel)
- **Start Command**: `npm run start` (or handled automatically by Vercel)

### Environment Setup Example (.env for local)
```dotenv
# .env (for local development only)
DATABASE_URL="postgres://<user>:<password>@<pooler-host>.neon.tech/<database>?sslmode=require"
NEXTAUTH_SECRET="YOUR_GENERATED_SECRET"
NEXTAUTH_URL="http://localhost:3000"
```

## Performance Optimization

### Image Optimization
```typescript
import Image from 'next/image';

export default function GameImage() {
  return (
    <Image
      src="/game-assets/dice.png"
      alt="Game dice"
      width={100}
      height={100}
      priority
    />
  );
}
```

### Code Splitting
```typescript
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('@/components/game/dice-roller'), {
  loading: () => <LoadingSpinner />
});
```

## Security

### Authentication
- Uses NextAuth.js with Prisma adapter.
- Primary login identifier is **email** via CredentialsProvider.
- Password hashing uses `bcrypt`.
- Session management via JWT.
- CSRF protection enabled by default for Credentials provider.

```typescript
// middleware.ts (Example - adjust matcher as needed)
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/signin' // Redirect unauthenticated users to this page
  }
});

// Apply middleware to protected routes
export const config = {
  matcher: [
    '/profile/:path*', // Example: protect profile page
    '/game/:path*',    // Example: protect game pages
    // Add other paths that require authentication
  ]
};
```

### Data Validation
- Use `zod` for validating API inputs (e.g., registration, game actions).

```typescript
// Example: lib/validation/auth.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  username: z.string().optional(), // Keep optional if username field exists
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
``` 