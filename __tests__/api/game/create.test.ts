import { createMocks } from 'node-mocks-http';
import { POST as handler } from '@/app/api/game/create/route';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth/next';
import { nanoid } from 'nanoid';

// Mock NextAuth getServerSession
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma
jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    game: {
      create: jest.fn(),
    },
  },
}));

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(),
}));

describe('POST /api/game/create', () => {
  let mockGetServerSession: jest.Mock;
  let mockPrismaGameCreate: jest.Mock;
  let mockNanoid: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockGetServerSession = getServerSession as jest.Mock;
    mockPrismaGameCreate = prisma.game.create as jest.Mock;
    mockNanoid = nanoid as jest.Mock;

    // Default mock implementations
    mockGetServerSession.mockResolvedValue(null); // Default to no session (guest)
    mockNanoid.mockReturnValue('ABCDEF'); // Default game code
    mockPrismaGameCreate.mockImplementation(async (args) => {
      // Simulate successful game creation with player
      return {
        id: 'clxxxxxxx',
        gameCode: 'ABCDEF',
        status: 'WAITING',
        creatorId: args.data.creatorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        gamePlayers: [
          {
            id: 'clzzzzzz',
            gameId: 'clxxxxxxx',
            userId: args.data.gamePlayers.create.userId,
            guestName: args.data.gamePlayers.create.guestName,
            joinOrder: 0,
            scores: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };
    });
  });

  it('should create a game as a guest successfully', async () => {
    const guestName = 'Guest Player';
    const { req, res } = createMocks({
      method: 'POST',
      body: { guestName },
    });

    await handler(req as any);

    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
    expect(mockNanoid).toHaveBeenCalledWith(6);
    expect(mockPrismaGameCreate).toHaveBeenCalledWith({
      data: {
        gameCode: 'ABCDEF',
        status: 'WAITING',
        creatorId: undefined, // No creatorId for guest
        gamePlayers: {
          create: {
            userId: undefined, // No userId for guest
            guestName: guestName,
            joinOrder: 0,
          },
        },
      },
      include: {
        gamePlayers: true,
      },
    });
    expect(res._getStatusCode()).toBe(201);
    const responseBody = JSON.parse(res._getData());
    expect(responseBody.gameCode).toBe('ABCDEF');
    expect(responseBody.gamePlayers[0].guestName).toBe(guestName);
    expect(responseBody.gamePlayers[0].userId).toBeUndefined();
  });

  it('should return 400 if guest name is missing for guest creation', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {}, // Missing guestName
    });

    await handler(req as any);

    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
    expect(mockPrismaGameCreate).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Guest name is required' });
  });

  it('should return 400 if guest name is empty for guest creation', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { guestName: '   ' }, // Empty guestName
    });

    await handler(req as any);

    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
    expect(mockPrismaGameCreate).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Guest name is required' });
  });

  it('should create a game as an authenticated user successfully', async () => {
    const userId = 'user-123';
    mockGetServerSession.mockResolvedValue({ user: { id: userId, email: 'user@test.com' } });

    const { req, res } = createMocks({
      method: 'POST',
      // No body needed for authenticated user
    });

    await handler(req as any);

    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
    expect(mockNanoid).toHaveBeenCalledWith(6);
    expect(mockPrismaGameCreate).toHaveBeenCalledWith({
      data: {
        gameCode: 'ABCDEF',
        status: 'WAITING',
        creatorId: userId,
        gamePlayers: {
          create: {
            userId: userId,
            guestName: undefined, // No guestName for user
            joinOrder: 0,
          },
        },
      },
      include: {
        gamePlayers: true,
      },
    });
    expect(res._getStatusCode()).toBe(201);
    const responseBody = JSON.parse(res._getData());
    expect(responseBody.gameCode).toBe('ABCDEF');
    expect(responseBody.gamePlayers[0].userId).toBe(userId);
    expect(responseBody.gamePlayers[0].guestName).toBeUndefined();
    expect(responseBody.creatorId).toBe(userId);
  });

   it('should return 500 if Prisma throws an error', async () => {
    mockPrismaGameCreate.mockRejectedValue(new Error('Database error'));

    const { req, res } = createMocks({
      method: 'POST',
      body: { guestName: 'Guest Test' },
    });

    await handler(req as any);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: 'An error occurred while creating the game' });
  });
}); 