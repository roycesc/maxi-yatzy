import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db/prisma'; // Assuming prisma client setup is in lib/db/prisma.ts

// Define the expected request body structure (optional but good practice)
interface RegisterRequestBody {
  email?: string;
  password?: string;
  username?: string; // Keep username if you want to store it (optional)
}

export async function POST(request: Request) {
  try {
    const body: RegisterRequestBody = await request.json();
    const { email, password, username } = body;

    // --- Input Validation ---
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    // TODO: Add proper email format validation (e.g., using a regex or library like Zod)

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 },
      );
    }

    // --- Check if user already exists by email ---
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already taken' },
        { status: 409 }, // 409 Conflict
      );
    }

    // --- Hash Password ---
    const saltRounds = 10; // Cost factor for hashing
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // --- Create User ---
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        username: username,
        // Initialize other fields as needed based on schema (e.g., coins)
        // email: ... // If you add email later
      },
    });

    // Important: Don't return the password hash in the response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('Registration API Error:', error);
    // Generic error for unexpected issues
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 },
    );
  }
} 