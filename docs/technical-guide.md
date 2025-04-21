# Technical Guide: Maxi Yatzy

## Project Structure

```
src/
├── app/                    # Next.js 14 app directory
│   ├── (auth)/            # Authentication routes
│   ├── (game)/            # Game-related routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── game/             # Game-specific components
│   └── ui/               # Generic UI components
├── lib/                   # Utility functions and types
│   ├── game/             # Game logic utilities
│   └── utils/            # General utilities
└── styles/               # Global styles
```

## Game Logic

### Dice Management
- Implemented in `src/components/game/dice-container.tsx`
- Uses React Server Components for initial state
- Client-side state management for dice interactions
- Proper handling of dice selection and rolling

### Score Calculation
- Implemented in `src/lib/game/score-calculator.ts`
- Type-safe calculation functions
- Proper handling of all scoring categories
- Bonus calculation for upper section

### Game State
- Managed through React Context in `src/components/game/game-context.tsx`
- Server-side state persistence using MongoDB
- Real-time updates planned for future implementation

## Component Patterns

### Server Components
- Used for data fetching and initial state
- Implemented in page components and layouts
- Proper error boundaries and loading states

### Client Components
- Isolated to specific interactive features
- Marked with 'use client' directive
- Examples: dice container, score card

### State Management
- React Context for global state
- Local state for component-specific data
- Proper memoization using useCallback and useMemo

## API Routes

### Game Management
- `/api/game/create` - Create new game
- `/api/game/join` - Join existing game
- `/api/game/state` - Get/update game state

### Authentication
- NextAuth.js implementation
- Custom email provider
- Session management

## Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  games         GamePlayer[]
}

model Game {
  id        String       @id @default(cuid())
  code      String       @unique
  status    GameStatus   @default(WAITING)
  players   GamePlayer[]
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}

model GamePlayer {
  id        String   @id @default(cuid())
  game      Game     @relation(fields: [gameId], references: [id])
  gameId    String
  user      User?    @relation(fields: [userId], references: [id])
  userId    String?
  name      String
  score     Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Deployment

### Environment Setup
```env
DATABASE_URL="mongodb://localhost:27017/maxi-yatzy"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### Build Process
1. Install dependencies: `npm install`
2. Generate Prisma client: `npx prisma generate`
3. Run migrations: `npx prisma db push`
4. Build application: `npm run build`
5. Start server: `npm start`

## Best Practices

### Code Style
- Use kebab-case for component files
- Follow TypeScript strict mode
- Implement proper error handling
- Use semantic HTML elements

### Performance
- Implement proper loading states
- Use React Server Components where possible
- Optimize images and assets
- Implement proper caching strategies

### Security
- Validate all user input
- Implement proper authentication
- Use secure session management
- Follow OWASP guidelines

## Testing

### Unit Tests
- Jest for testing
- React Testing Library for components
- Proper test coverage for game logic

### E2E Tests
- Cypress for E2E testing
- Test critical user flows
- Mobile testing support

## Future Improvements

### Technical Debt
- Implement WebSocket for real-time updates
- Enhance error handling and logging
- Improve test coverage
- Optimize build process

### Features
- Real-time game synchronization
- Enhanced player profiles
- Social features
- Tournament system 