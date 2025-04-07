import { test, expect, describe, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { prisma } from '@/lib/db/prisma';
import { hash } from 'bcrypt';
import { createMocks } from 'node-mocks-http';
import { POST as registerHandler } from '@/app/api/auth/register/route';
import { NextResponse } from 'next/server';

// Mock NextAuth's signIn function
jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  return {
    ...originalModule,
    signIn: jest.fn(),
    signOut: jest.fn(),
    useSession: jest.fn(() => {
      return { data: null, status: 'unauthenticated' };
    }),
  };
});

const mockUser = {
  email: 'test@example.com',
  username: 'testuser',
  password: 'Password123!',
};

describe('Authentication Flow Tests', () => {
  // Clean up test data before all tests
  beforeAll(async () => {
    // Clear test user if exists
    await prisma.user.deleteMany({
      where: { email: mockUser.email },
    });
  });

  // Clean up after all tests
  afterAll(async () => {
    // Remove test user
    await prisma.user.deleteMany({
      where: { email: mockUser.email },
    });
    await prisma.$disconnect();
  });

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should register a new user', async () => {
    // Create mock request with user data
    const { req } = createMocks({
      method: 'POST',
      body: mockUser,
    });

    // Convert the request body to a string for Request constructor
    req.json = jest.fn().mockResolvedValue(mockUser);
    
    // Call the register handler
    const response = await registerHandler(req as unknown as Request);
    const responseData = await response.json();
    
    // Check response status and ensure user was created
    expect(response.status).toBe(201);
    expect(responseData.email).toBe(mockUser.email);
    expect(responseData.username).toBe(mockUser.username);
    expect(responseData.password).toBeUndefined(); // Password should not be returned
    
    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { email: mockUser.email },
    });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.email).toBe(mockUser.email);
  });

  test('Should not register a user with an existing email', async () => {
    // Create mock request with existing user data
    const { req } = createMocks({
      method: 'POST',
      body: mockUser,
    });

    // Convert the request body to a string for Request constructor
    req.json = jest.fn().mockResolvedValue(mockUser);
    
    // Call the register handler
    const response = await registerHandler(req as unknown as Request);
    const responseData = await response.json();
    
    // Check response indicates conflict
    expect(response.status).toBe(409);
    expect(responseData.error).toBe('Email already taken');
  });

  test('Should validate required fields during registration', async () => {
    // Test missing email
    const missingEmail = { ...mockUser, email: '' };
    const { req: reqNoEmail } = createMocks({
      method: 'POST',
      body: missingEmail,
    });
    reqNoEmail.json = jest.fn().mockResolvedValue(missingEmail);
    
    const responseNoEmail = await registerHandler(reqNoEmail as unknown as Request);
    expect(responseNoEmail.status).toBe(400);
    
    // Test missing password
    const missingPassword = { ...mockUser, password: '' };
    const { req: reqNoPassword } = createMocks({
      method: 'POST',
      body: missingPassword,
    });
    reqNoPassword.json = jest.fn().mockResolvedValue(missingPassword);
    
    const responseNoPassword = await registerHandler(reqNoPassword as unknown as Request);
    expect(responseNoPassword.status).toBe(400);
    
    // Test invalid email format
    const invalidEmail = { ...mockUser, email: 'notanemail' };
    const { req: reqInvalidEmail } = createMocks({
      method: 'POST',
      body: invalidEmail,
    });
    reqInvalidEmail.json = jest.fn().mockResolvedValue(invalidEmail);
    
    const responseInvalidEmail = await registerHandler(reqInvalidEmail as unknown as Request);
    expect(responseInvalidEmail.status).toBe(400);
    
    // Test short password
    const shortPassword = { ...mockUser, password: 'short' };
    const { req: reqShortPassword } = createMocks({
      method: 'POST',
      body: shortPassword,
    });
    reqShortPassword.json = jest.fn().mockResolvedValue(shortPassword);
    
    const responseShortPassword = await registerHandler(reqShortPassword as unknown as Request);
    expect(responseShortPassword.status).toBe(400);
  });
}); 