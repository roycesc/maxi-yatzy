'use client'; // This page needs client-side interaction

import { useState, useEffect } from 'react';
import { signIn, getCsrfToken } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Fetch CSRF token required by NextAuth for Credentials provider
  useEffect(() => {
    getCsrfToken().then(token => {
      if (token) setCsrfToken(token);
    });
  }, []);

  // Map NextAuth error codes to user-friendly messages
  useEffect(() => {
    if (error === 'CredentialsSignin') {
      setLoginError('Invalid username or password. Please try again.');
    } else if (error) {
      setLoginError('An unexpected error occurred during sign in.');
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false, // Handle redirect manually after checking result
        username,
        password,
        callbackUrl: callbackUrl, // Pass the original callbackUrl
      });

      if (result?.error) {
        console.error('Sign in error:', result.error);
        // Error is already handled by the useEffect listening to searchParams
        // Set a generic error if needed, or rely on the param listener
        setLoginError('Invalid username or password. Please try again.');
        setLoading(false);
      } else if (result?.ok) {
        // Sign-in successful
        router.push(callbackUrl); // Redirect to original destination or home
      } else {
        // Handle other potential non-error cases if necessary
        setLoginError('Sign in failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Sign in exception:', err);
      setLoginError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 font-heading">
          Sign In to Maxi Yatzy
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Include CSRF token as hidden input */}
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="jsmith"
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
              placeholder="********"
            />
          </div>

          {loginError && (
            <p className="text-sm text-error text-center">{loginError}</p>
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
          Don't have an account?{' '}
          {/* <Link href="/auth/signup" className="font-medium text-primary hover:text-primary/80">
            Sign Up
          </Link> */}
          Sign Up (Coming Soon)
        </p>
      </div>
    </div>
  );
} 