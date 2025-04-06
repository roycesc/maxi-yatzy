import React, { Suspense } from 'react';
import SignInForm from '@/components/auth/sign-in-form'; // Adjust import path as necessary

// Basic Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 font-heading">
          Loading Sign In...
        </h1>
        {/* You can add a spinner or more detailed loading state here */}
        <div className="text-center text-gray-500">Please wait</div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Suspense fallback={<LoadingFallback />}>
        <SignInForm />
      </Suspense>
    </div>
  );
} 