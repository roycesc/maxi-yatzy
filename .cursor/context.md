# Maxi Yatzy - Project Context

## Project Goals
- Create a multiplayer Yatzy game with real-time features
- Implement a modern, responsive UI
- Ensure high performance and reliability
- Provide a seamless user experience

## Development Patterns

### Component Structure
- Use kebab-case for component names (e.g., `game-board.tsx`)
- Components should be small and focused
- Server components by default, client components only when necessary
- Use TypeScript interfaces for props

### State Management
- Use React Server Components for data fetching
- Implement proper loading states
- Handle errors gracefully
- Use optimistic updates for better UX

### Styling Conventions
- Use TailwindCSS utility classes
- Follow mobile-first approach
- Maintain consistent spacing and typography
- Use semantic color variables

### Data Flow
- API routes in `app/api`
- Database models in `lib/models`
- Type definitions in `types/`
- Utility functions in `lib/utils`

### Authentication
- NextAuth.js for authentication
- Protected routes using middleware
- Role-based access control
- Secure session management

### Testing Strategy
- Unit tests for utility functions
- Component tests for UI elements
- API route tests
- Integration tests for game logic

## Common Patterns

### Error Handling
```typescript
try {
  // operation
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error('User-friendly error message');
}
```

### Loading States
```typescript
export default function Component() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Content />
    </Suspense>
  );
}
```

### API Routes
```typescript
export async function GET(request: Request) {
  try {
    const data = await fetchData();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
```

## Project-Specific Rules
1. Always use TypeScript
2. Follow Next.js 15.2.4 best practices
3. Implement proper error boundaries
4. Use semantic HTML elements
5. Ensure accessibility compliance
6. Write comprehensive documentation
7. Follow the project's code style guide 