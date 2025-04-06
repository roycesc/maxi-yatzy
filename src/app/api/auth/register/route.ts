import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';

// Consider adding input validation with Zod

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Basic validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 } // 409 Conflict
      );
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the new user
    // Using `as any` on data as a workaround for persistent TS errors
    const newUser = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        // Add default values for other fields if necessary, e.g., name
      } as any, // <-- Workaround for TS type issue
    });

    // Don't return the password hash in the response
    // Type assertion needed here too due to the `as any` above affecting inference
    const { password: _, ...userWithoutPassword } = newUser as { password?: string | null } & Omit<typeof newUser, 'password'>;

    return NextResponse.json(userWithoutPassword, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 