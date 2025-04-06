'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UpdateProfileForm from '@/components/profile/update-profile-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Client-side protection: Redirect if not authenticated or loading
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/profile');
    }
  }, [status, router]);

  const handleGoBack = () => {
    router.back();
  };

  if (status === 'loading') {
    return (
      <div className="text-center p-10">
        <p>Loading profile...</p>
        {/* Add a spinner or better loading UI */}
      </div>
    );
  }

  if (status === 'unauthenticated') {
    // Although useEffect redirects, show minimal content while redirecting
    return null; 
  }

  // Assumes session is available after loading and authenticated checks
  if (!session?.user) {
      return <p className="text-center p-10 text-error">Could not load user profile.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button 
        variant="outline"
        size="sm"
        onClick={handleGoBack}
        className="mb-6 flex items-center space-x-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>

      <h1 className="text-3xl font-bold mb-6 font-heading text-center">Your Profile</h1>
      <UpdateProfileForm user={session.user} />
    </div>
  );
} 