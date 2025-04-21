'use client'; // This component needs client-side interaction

import React, { useState, useEffect } from 'react';
import { signIn, getCsrfToken } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Define the props if any; for now, it uses hooks internally
// interface SignInFormProps {}

export default function SignInForm(/*props: SignInFormProps*/) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');
  const message = searchParams.get('message'); // Check for success message from signup

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch CSRF token required by NextAuth for Credentials provider
  useEffect(() => {
    getCsrfToken().then(token => {
      if (token) setCsrfToken(token);
    });
  }, []);

  // Map NextAuth error codes to user-friendly messages
  useEffect(() => {
    if (error === 'CredentialsSignin') {
      setLoginError('Invalid email or password. Please try again.');
    } else if (error) {
      setLoginError('An unexpected error occurred during sign in.');
    } else {
      setLoginError(null);
    }
  }, [error]);

  // Display success message from signup redirect
  useEffect(() => {
    if (message === 'signup_success') {
      setSuccessMessage('Account created successfully! Please sign in.');
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    setSuccessMessage(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (result?.error) {
        setLoginError('Invalid email or password. Please try again.');
      } else if (result?.ok) {
        router.push(callbackUrl);
      } else {
        setLoginError('Sign in failed. Please try again.');
      }
    } catch (err) {
      setLoginError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-900 font-heading">
        Sign In to Maxi Yatzy
      </h1>

      {/* Display success message if present */}
      {successMessage && (
        <p className="text-sm text-green-600 bg-green-50 p-3 rounded text-center">
          {successMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Include CSRF token as hidden input */}
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="Enter your password"
          />
        </div>

        {loginError && (
          <p className="text-sm text-red-600 text-center">{loginError}</p>
        )}

        <div>
          <button
            type="submit"
            disabled={loading || !csrfToken}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </form>

      {/* Add link to Sign Up page later */}
      <p className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-medium text-primary hover:text-primary/80">
          Sign Up
        </Link>
        {/* Sign Up (Coming Soon) */}
      </p>
      
      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>

      {/* Guest Login Button */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Play as Guest
        </button>
        
        {/* Demo Game Button */}
        <button
          type="button"
          onClick={() => router.push('/play')}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          Play Demo Game
        </button>
      </div>
    </div>
  );
} 