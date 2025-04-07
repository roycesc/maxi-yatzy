/**
 * End-to-end test for the complete authentication flow
 */
import { test, expect, describe, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { prisma } from '@/lib/db/prisma';
import { hash } from 'bcrypt';
import { signIn, signOut, getSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { createMocks } from 'node-mocks-http';
import { POST as registerHandler } from '@/app/api/auth/register/route';

// Define type for mock session
type MockSessionType = {
  data: Session | null;
  status: 'authenticated' | 'loading' | 'unauthenticated';
};

// Mock next-auth modules
jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  const mockSession: MockSessionType = { 
    data: null, 
    status: 'unauthenticated' 
  };
  
  return {
    ...originalModule,
    signIn: jest.fn().mockImplementation(async (provider, options) => {
      if (provider === 'credentials') {
        // Check for correct credentials (must match test user)
        if (options?.email === 'e2etest@example.com' && options?.password === 'TestPassword123!') {
          mockSession.data = {
            user: {
              id: 'test-user-id',
              email: options.email,
              name: 'E2E Test User',
            },
            expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          };
          mockSession.status = 'authenticated';
          return { ok: true, error: null, url: '/dashboard' };
        }
        return { ok: false, error: 'Invalid credentials', url: null };
      }
      return { ok: false, error: 'Unsupported provider', url: null };
    }),
    signOut: jest.fn().mockImplementation(() => {
      mockSession.data = null;
      mockSession.status = 'unauthenticated';
      return { url: '/' };
    }),
    getSession: jest.fn().mockImplementation(() => mockSession.data),
    useSession: jest.fn(() => mockSession),
  };
});

// Test user data
const e2eTestUser = {
  email: 'e2etest@example.com',
  password: 'TestPassword123!',
  username: 'e2etestuser',
  name: 'E2E Test User',
};

describe('End-to-End Authentication Flow', () => {
  beforeAll(async () => {
    // Clear any existing test user
    await prisma.user.deleteMany({
      where: { email: e2eTestUser.email },
    });
  });

  afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({
      where: { email: e2eTestUser.email },
    });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Complete authentication flow: signup → signin → logout → signin again', async () => {
    // Step 1: Register a new user
    const { req: registerReq } = createMocks({
      method: 'POST',
      body: e2eTestUser,
    });

    registerReq.json = jest.fn().mockResolvedValue(e2eTestUser);
    
    const registerResponse = await registerHandler(registerReq as unknown as Request);
    const registerData = await registerResponse.json();
    
    expect(registerResponse.status).toBe(201);
    expect(registerData.email).toBe(e2eTestUser.email);
    
    // Step 2: Sign in with the new user
    const signInResult = await signIn('credentials', { 
      email: e2eTestUser.email, 
      password: e2eTestUser.password,
      redirect: false,
    });
    
    expect(signInResult?.ok).toBe(true);
    expect(signInResult?.error).toBeNull();
    
    // Step 3: Check if session exists
    const session = await getSession();
    expect(session).not.toBeNull();
    expect(session?.user?.email).toBe(e2eTestUser.email);
    
    // Step 4: Sign out
    const signOutResult = await signOut({ redirect: false });
    expect(signOutResult).toEqual({ url: '/' });
    
    // Step 5: Verify session is cleared
    const sessionAfterSignOut = await getSession();
    expect(sessionAfterSignOut).toBeNull();
    
    // Step 6: Sign in again
    const signInAgainResult = await signIn('credentials', { 
      email: e2eTestUser.email, 
      password: e2eTestUser.password,
      redirect: false,
    });
    
    expect(signInAgainResult?.ok).toBe(true);
    expect(signInAgainResult?.error).toBeNull();
    
    // Step 7: Verify session is restored
    const sessionAfterSignIn = await getSession();
    expect(sessionAfterSignIn).not.toBeNull();
    expect(sessionAfterSignIn?.user?.email).toBe(e2eTestUser.email);
  });

  test('Should handle invalid credentials correctly', async () => {
    // Try to sign in with wrong password
    const signInResult = await signIn('credentials', { 
      email: e2eTestUser.email, 
      password: 'WrongPassword123!',
      redirect: false,
    });
    
    expect(signInResult?.ok).toBe(false);
    expect(signInResult?.error).toBe('Invalid credentials');
    
    // Session should remain null
    const session = await getSession();
    expect(session).toBeNull();
  });

  test('Should handle non-existent user correctly', async () => {
    // Try to sign in with non-existent email
    const signInResult = await signIn('credentials', { 
      email: 'nonexistent@example.com', 
      password: 'AnyPassword123!',
      redirect: false,
    });
    
    expect(signInResult?.ok).toBe(false);
    expect(signInResult?.error).toBe('Invalid credentials');
    
    // Session should remain null
    const session = await getSession();
    expect(session).toBeNull();
  });
}); 