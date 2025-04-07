import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import { nanoid } from 'nanoid'; // For generating unique game codes

// Expected request body for guest users
interface CreateGameRequestBody {
  guestName?: string;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  let userId: string | undefined = session?.user?.id;
  let guestName: string | undefined;

  // If user is not logged in, try to get guest name from request body
  if (!userId) {
    try {
      const body: CreateGameRequestBody = await request.json();
      if (body.guestName && body.guestName.trim()) {
        guestName = body.guestName.trim();
      } else {
        return NextResponse.json({ error: 'Guest name is required' }, { status: 400 });
      }
      // Optional: Add validation for guest name length, characters, etc.
    } catch (error) {
      // Handle cases where request body is missing or invalid JSON
      return NextResponse.json({ error: 'Invalid request body for guest' }, { status: 400 });
    }
  }

  try {
    // Generate a unique game code (e.g., 6 characters long)
    // Ensure uniqueness check in a production scenario (loop or catch db constraint)
    const gameCode = nanoid(6).toUpperCase();

    // Create the game and the first player (creator)
    const newGame = await prisma.game.create({
      data: {
        gameCode: gameCode,
        status: 'WAITING',
        // Associate creator only if logged in
        creatorId: userId,
        gamePlayers: {
          create: {
            // Associate user only if logged in
            userId: userId,
            // Use guest name only if not logged in
            guestName: userId ? undefined : guestName,
            joinOrder: 0, // Creator is always the first player
            // Add other initial GamePlayer fields if needed (e.g., acceptedBet)
          },
        },
      },
      include: {
        gamePlayers: true, // Include the created player in the response
      },
    });

    return NextResponse.json(newGame, { status: 201 });

  } catch (error) {
    console.error('Game Creation Error:', error);
    // Handle potential errors like database connection issues or Prisma errors
    return NextResponse.json(
      { error: 'An error occurred while creating the game' },
      { status: 500 },
    );
  }
} 