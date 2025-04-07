import { test, expect, describe, beforeAll, afterAll, afterEach } from '@jest/globals';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { hash } from 'bcrypt';
import { NextAuthOptions } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';

// Mock NextAuth's signIn and signOut functions
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Create a test user with a known password
const testUser = {
  email: 'auth-test@example.com',
  password: 'SecurePassword123!',
  username: 'authtest',
  name: 'Auth Test User',
};

describe('NextAuth Credentials Provider Tests', () => {
  beforeAll(async () => {
    // Clear any existing test user
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });

    // Create a test user with known credentials
    const hashedPassword = await hash(testUser.password, 10);
    await prisma.user.create({
      data: {
        email: testUser.email,
        username: testUser.username,
        name: testUser.name,
        password: hashedPassword,
      },
    });
  });

  afterAll(async () => {
    // Remove test user
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.$disconnect();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should authorize with valid credentials', async () => {
    // Get authorize function from options
    const credentialsProvider = authOptions.providers.find(
      (provider) => provider.id === 'credentials'
    );
    
    if (!credentialsProvider || !('authorize' in credentialsProvider)) {
      throw new Error('Credentials provider not configured correctly');
    }

    const authorizeFunction = credentialsProvider.authorize;
    
    // Call authorize with valid credentials
    const user = await authorizeFunction({
      email: testUser.email,
      password: testUser.password,
    }, {} as any);
    
    // Check that the user is authorized
    expect(user).not.toBeNull();
    expect(user?.email).toBe(testUser.email);
    // Username check - need to type assert since NextAuth User doesn't include username by default
    if (user) {
      expect((user as any).username).toBe(testUser.username);
    }
    // Password should not be returned
    expect((user as any)?.password).toBeUndefined();
  });

  test('Should reject invalid password', async () => {
    // Get authorize function from options
    const credentialsProvider = authOptions.providers.find(
      (provider) => provider.id === 'credentials'
    );
    
    if (!credentialsProvider || !('authorize' in credentialsProvider)) {
      throw new Error('Credentials provider not configured correctly');
    }

    const authorizeFunction = credentialsProvider.authorize;
    
    // Call authorize with invalid password
    const user = await authorizeFunction({
      email: testUser.email,
      password: 'WrongPassword123!',
    }, {} as any);
    
    // Check that authorization fails
    expect(user).toBeNull();
  });

  test('Should reject non-existent user', async () => {
    // Get authorize function from options
    const credentialsProvider = authOptions.providers.find(
      (provider) => provider.id === 'credentials'
    );
    
    if (!credentialsProvider || !('authorize' in credentialsProvider)) {
      throw new Error('Credentials provider not configured correctly');
    }

    const authorizeFunction = credentialsProvider.authorize;
    
    // Call authorize with non-existent user
    const user = await authorizeFunction({
      email: 'nonexistent@example.com',
      password: 'AnyPassword123!',
    }, {} as any);
    
    // Check that authorization fails
    expect(user).toBeNull();
  });

  test('Should reject empty credentials', async () => {
    // Get authorize function from options
    const credentialsProvider = authOptions.providers.find(
      (provider) => provider.id === 'credentials'
    );
    
    if (!credentialsProvider || !('authorize' in credentialsProvider)) {
      throw new Error('Credentials provider not configured correctly');
    }

    const authorizeFunction = credentialsProvider.authorize;
    
    // Call authorize with empty email
    const userNoEmail = await authorizeFunction({
      email: '',
      password: testUser.password,
    }, {} as any);
    
    // Call authorize with empty password
    const userNoPassword = await authorizeFunction({
      email: testUser.email,
      password: '',
    }, {} as any);
    
    // Check that authorization fails in both cases
    expect(userNoEmail).toBeNull();
    expect(userNoPassword).toBeNull();
  });
}); 