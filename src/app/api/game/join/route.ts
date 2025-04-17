import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

// Zod schema for validating the request body
const joinGameSchema = z.object({
  gameCode: z.string().length(6, { message: "Invalid game code format" }), // Assuming 6-char codes
  guestName: z.string().trim().min(1, { message: "Guest name cannot be empty" }).optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  let parsedBody;

  // 1. Validate Request Body
  try {
    const body = await request.json();
    parsedBody = joinGameSchema.safeParse(body);

    if (!parsedBody.success) {
      // Extract specific error messages if needed
      const errorMessages = parsedBody.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ error: `Invalid input: ${errorMessages}` }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { gameCode, guestName } = parsedBody.data;

  // 2. Handle Guest/Auth Logic
  if (!userId && !guestName) {
    return NextResponse.json({ error: 'Guest name is required to join' }, { status: 400 });
  }

  try {
    // 3. Find the Game and Check Status/Capacity
    const game = await prisma.game.findUnique({
      where: { gameCode },
      include: { gamePlayers: true }, // Include players to check count and existing players
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.status !== 'WAITING') {
      return NextResponse.json({ error: 'Game has already started or finished' }, { status: 403 });
    }

    // Check if max players reached (e.g., 4)
    if (game.gamePlayers.length >= 4) {
      return NextResponse.json({ error: 'Game is full' }, { status: 403 });
    }

    // 4. Check if Player (User or Guest) is Already in Game
    const isUserAlreadyInGame = userId && game.gamePlayers.some((p: any) => p.userId === userId);
    const isGuestAlreadyInGame = !userId && guestName && game.gamePlayers.some((p: any) => p.guestName === guestName);

    if (isUserAlreadyInGame) {
      return NextResponse.json({ error: 'You are already in this game' }, { status: 409 });
    }
    if (isGuestAlreadyInGame) {
      return NextResponse.json({ error: 'This guest name is already taken in this game' }, { status: 409 });
    }

    // 5. Add Player to Game
    const nextJoinOrder = game.gamePlayers.length; // Simple join order (0-indexed)

    const newPlayer = await prisma.gamePlayer.create({
      data: {
        gameId: game.id,
        userId: userId,
        guestName: userId ? undefined : guestName,
        joinOrder: nextJoinOrder,
        // Add other initial GamePlayer fields if needed
      },
    });

    // Optionally: If adding this player makes the game full, update game status to ACTIVE
    // if (nextJoinOrder === 3) { // If 0, 1, 2, 3 (4 players total)
    //   await prisma.game.update({ where: { id: game.id }, data: { status: 'ACTIVE' } });
    // }

    // Return the newly added player or the updated game state
    return NextResponse.json({ message: 'Successfully joined game', player: newPlayer }, { status: 200 });

  } catch (error) {
    console.error('Join Game Error:', error);
    if (error instanceof z.ZodError) { // Catch potential Zod errors not caught earlier
        return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An error occurred while joining the game' },
      { status: 500 },
    );
  }
} 