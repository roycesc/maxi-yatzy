import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';
import { User as PrismaUser } from '@prisma/client';

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, currentPassword, newPassword } = body;

    if (!name && !newPassword) {
        return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
    }
    
    // Fetch the current user data including the password hash
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: Partial<PrismaUser> = {};

    // Update name if provided and different
    if (name && name !== currentUser.name) {
      updateData.name = name;
    }

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
      }
      if (!currentUser.password) {
        // Should not happen for users registered via credentials
        return NextResponse.json({ error: 'Cannot change password for this account type' }, { status: 400 });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
      }

      // Hash new password
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(newPassword, saltRounds);
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No changes detected' }, { status: 200 });
    }

    // Update user in the database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    // Don't return password hash
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ message: 'Profile updated successfully', user: userWithoutPassword }, { status: 200 });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating profile' },
      { status: 500 }
    );
  }
} 