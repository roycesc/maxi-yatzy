import { createMocks, RequestMethod } from 'node-mocks-http';
import { POST as handler } from '@/app/api/game/join/route';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth/next';
import { GameStatus } from '@prisma/client';

// Mock NextAuth getServerSession
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma
jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    game: {
      findUnique: jest.fn(),
    },
    gamePlayer: {
      create: jest.fn(),
    },
  },
}));

describe('POST /api/game/join', () => {
  let mockGetServerSession: jest.Mock;
  let mockPrismaGameFindUnique: jest.Mock;
  let mockPrismaGamePlayerCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession = getServerSession as jest.Mock;
    mockPrismaGameFindUnique = prisma.game.findUnique as jest.Mock;
    mockPrismaGamePlayerCreate = prisma.gamePlayer.create as jest.Mock;

    // Default mocks
    mockGetServerSession.mockResolvedValue(null); // Default to guest
    mockPrismaGameFindUnique.mockResolvedValue(null); // Default to game not found
    mockPrismaGamePlayerCreate.mockImplementation(async (args) => ({
      id: 'player-new',
      gameId: args.data.gameId,
      userId: args.data.userId,
      guestName: args.data.guestName,
      joinOrder: args.data.joinOrder,
      scores: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  const mockRequest = (method: RequestMethod, body: any) => {
    return createMocks({ method, body });
  };

  // --- Guest Scenarios ---
  it('should allow a guest to join a valid game', async () => {
    const gameCode = 'VALIDC';
    const guestName = 'GuestJoiner';
    const gameId = 'game-1';
    mockPrismaGameFindUnique.mockResolvedValue({
      id: gameId,
      gameCode: gameCode,
      status: GameStatus.WAITING,
      gamePlayers: [], // Game is empty
    });

    const { req, res } = mockRequest('POST', { gameCode, guestName });
    await handler(req as any);

    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
    expect(mockPrismaGameFindUnique).toHaveBeenCalledWith({ where: { gameCode }, include: { gamePlayers: true } });
    expect(mockPrismaGamePlayerCreate).toHaveBeenCalledWith({
      data: {
        gameId: gameId,
        userId: undefined,
        guestName: guestName,
        joinOrder: 0,
      },
    });
    expect(res._getStatusCode()).toBe(200);
    const responseBody = JSON.parse(res._getData());
    expect(responseBody.message).toBe('Successfully joined game');
    expect(responseBody.player.guestName).toBe(guestName);
  });

  it('should return 400 if guest name is missing for guest join', async () => {
    const gameCode = 'NOGUEST';
    const { req, res } = mockRequest('POST', { gameCode }); // Missing guestName

    await handler(req as any);

    expect(mockPrismaGameFindUnique).not.toHaveBeenCalled();
    expect(mockPrismaGamePlayerCreate).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Guest name is required to join' });
  });

  it('should return 400 if game code is invalid format', async () => {
    const { req, res } = mockRequest('POST', { gameCode: 'INVALID', guestName: 'Tester' });

    await handler(req as any);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).error).toContain('Invalid game code format');
  });

  it('should return 404 if game code does not exist', async () => {
    const gameCode = 'NOTACODE';
    const { req, res } = mockRequest('POST', { gameCode, guestName: 'Tester' });
    mockPrismaGameFindUnique.mockResolvedValue(null); // Simulate game not found

    await handler(req as any);
    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Game not found' });
  });

  it('should return 403 if game is not WAITING', async () => {
    const gameCode = 'STARTED';
    mockPrismaGameFindUnique.mockResolvedValue({ id: 'game-2', gameCode, status: GameStatus.ACTIVE, gamePlayers: [] });
    const { req, res } = mockRequest('POST', { gameCode, guestName: 'LateGuest' });

    await handler(req as any);
    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Game has already started or finished' });
  });

  it('should return 403 if game is full', async () => {
    const gameCode = 'FULLGAME';
    mockPrismaGameFindUnique.mockResolvedValue({
      id: 'game-3',
      gameCode,
      status: GameStatus.WAITING,
      gamePlayers: [{}, {}, {}, {}], // Simulate 4 players
    });
    const { req, res } = mockRequest('POST', { gameCode, guestName: 'FifthWheel' });

    await handler(req as any);
    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Game is full' });
  });

  it('should return 409 if guest name is already taken in the game', async () => {
    const gameCode = 'DUPGUEST';
    const guestName = 'TakenName';
    mockPrismaGameFindUnique.mockResolvedValue({
      id: 'game-4',
      gameCode,
      status: GameStatus.WAITING,
      gamePlayers: [{ id: 'p1', guestName: guestName, userId: null }],
    });
    const { req, res } = mockRequest('POST', { gameCode, guestName });

    await handler(req as any);
    expect(res._getStatusCode()).toBe(409);
    expect(JSON.parse(res._getData())).toEqual({ error: 'This guest name is already taken in this game' });
  });

  // --- Authenticated User Scenarios ---
  it('should allow an authenticated user to join a valid game', async () => {
    const gameCode = 'USERJOIN';
    const userId = 'user-abc';
    const gameId = 'game-5';
    mockGetServerSession.mockResolvedValue({ user: { id: userId } });
    mockPrismaGameFindUnique.mockResolvedValue({
      id: gameId,
      gameCode: gameCode,
      status: GameStatus.WAITING,
      gamePlayers: [],
    });

    const { req, res } = mockRequest('POST', { gameCode }); // No guestName needed
    await handler(req as any);

    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
    expect(mockPrismaGameFindUnique).toHaveBeenCalledWith({ where: { gameCode }, include: { gamePlayers: true } });
    expect(mockPrismaGamePlayerCreate).toHaveBeenCalledWith({
      data: {
        gameId: gameId,
        userId: userId,
        guestName: undefined,
        joinOrder: 0,
      },
    });
    expect(res._getStatusCode()).toBe(200);
    const responseBody = JSON.parse(res._getData());
    expect(responseBody.player.userId).toBe(userId);
  });

  it('should return 409 if authenticated user is already in the game', async () => {
    const gameCode = 'USERDUP';
    const userId = 'user-def';
    mockGetServerSession.mockResolvedValue({ user: { id: userId } });
    mockPrismaGameFindUnique.mockResolvedValue({
      id: 'game-6',
      gameCode,
      status: GameStatus.WAITING,
      gamePlayers: [{ id: 'p1', userId: userId, guestName: null }],
    });

    const { req, res } = mockRequest('POST', { gameCode });
    await handler(req as any);

    expect(res._getStatusCode()).toBe(409);
    expect(JSON.parse(res._getData())).toEqual({ error: 'You are already in this game' });
  });

   it('should return 500 if Prisma findUnique throws an error', async () => {
      mockPrismaGameFindUnique.mockRejectedValue(new Error('DB find error'));
      const { req, res } = mockRequest('POST', { gameCode: 'ERRORC', guestName: 'Tester' });
      await handler(req as any);
      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({ error: 'An error occurred while joining the game' });
   });

    it('should return 500 if Prisma create throws an error', async () => {
      const gameCode = 'CREATEER';
      mockPrismaGameFindUnique.mockResolvedValue({ id: 'game-7', gameCode, status: GameStatus.WAITING, gamePlayers: [] });
      mockPrismaGamePlayerCreate.mockRejectedValue(new Error('DB create error'));
      const { req, res } = mockRequest('POST', { gameCode, guestName: 'Tester' });
      await handler(req as any);
      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({ error: 'An error occurred while joining the game' });
   });
}); 