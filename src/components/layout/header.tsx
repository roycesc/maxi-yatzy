'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

/**
 * Generates initials from a user's name for use in Avatar fallback.
 * Handles null/undefined names, empty strings, and extra whitespace.
 * @param name - The user's full name.
 * @returns A string containing 1 or 2 initials, or '?' if name is invalid.
 */
function getInitials(name: string | null | undefined): string {
  // 1. Check for null, undefined, or empty/whitespace string
  if (!name || !name.trim()) return '?'; 

  // 2. Trim, split, and filter out empty parts
  const nameParts = name.trim().split(' ').filter(part => part.length > 0); 

  // 3. Handle edge case where no valid parts were found
  if (nameParts.length === 0) return '?'; 

  // 4. Handle single valid name part (take first 1 or 2 chars)
  if (nameParts.length === 1) {
    return nameParts[0].substring(0, Math.min(2, nameParts[0].length)).toUpperCase();
  }

  // 5. Handle multiple valid name parts (first char of first and last part)
  return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
}

/**
 * Application Header component.
 * Displays the site title and navigation links.
 * Shows Sign In/Sign Up buttons or a User dropdown based on auth status.
 */
export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter(); // Initialize router

  // Handler for signing out the user
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' }); // Redirect to home page after sign out
  };

  // Handler for navigating to the profile page
  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <header className="bg-main-blue text-white py-3 px-4 shadow-md sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center">
        {/* Site Title/Link */}
        <Link href="/" className="text-2xl font-bold font-heading hover:text-white/90 transition-colors">
          Maxi Yatzy
        </Link>
        
        {/* Right Aligned Section (Auth Status) */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Loading State */}
          {status === 'loading' && (
            (<div className="h-10 w-20 rounded-lg bg-white/20 animate-pulse"></div>) // Placeholder for buttons
          )}

          {/* Logged In State: User Dropdown */}
          {status === 'authenticated' && session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* Avatar Trigger Button */}
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border-2 border-white">
                  <Avatar className="h-9 w-9">
                    {/* Assuming user.image is available; if not, fallback is used */}
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User Avatar'} />
                    <AvatarFallback className="bg-white text-main-blue">
                      {getInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border-main-blue border-2 mt-2" align="end" forceMount>
                {/* User Info Label */}
                <DropdownMenuLabel className="font-semibold">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">
                      {session.user.name || 'User'}
                    </p>
                    {session.user.email && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-main-blue/20" />
                {/* Profile Link Item */}
                <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer hover:bg-main-blue/10">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-main-blue/20" />
                {/* Sign Out Item */}
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-error-red hover:bg-error-red/10">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Logged Out State: Sign In/Sign Up Buttons */}
          {status === 'unauthenticated' && (
            <>
              {/* Sign Up Button */}
              <Link href="/auth/signup" passHref >
                <Button variant="outline" size="sm" className="bg-white text-main-blue border-white hover:bg-white/90">
                  Sign Up
                </Button>
              </Link>
              {/* Sign In Button */}
              <Link href="/auth/signin" passHref >
                <Button variant="secondary" size="sm">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
} 