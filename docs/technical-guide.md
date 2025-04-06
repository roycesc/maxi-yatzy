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
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Handle request
}
```

## Database

- **Provider**: Neon Serverless Postgres ([neon.tech](https://neon.tech/))
- **ORM**: Prisma ([prisma.io](https://www.prisma.io/))
- **Connection**: Pooled connection string required, especially for serverless deployment.
- **Schema Definition**: See `prisma/schema.prisma`.
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

### Component Tests
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
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/signin'
  }
});

export const config = {
  matcher: ['/game/:path*']
};
```

### Data Validation
```typescript
// lib/validation/game.ts
import { z } from 'zod';

export const gameSchema = z.object({
  players: z.array(z.string()),
  scores: z.record(z.number()),
  status: z.enum(['waiting', 'active', 'completed'])
});
``` 