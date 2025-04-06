'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { toast } from "sonner" // Import toast function from sonner
import { Button } from "@/components/ui/button"; // Import Button for styling
import { Input } from "@/components/ui/input"; // Import Input for styling
import { Label } from "@/components/ui/label"; // Import Label for styling

interface UpdateProfileFormProps {
  user: NonNullable<Session['user']>; // User object passed from profile page
}

/**
 * Form component for updating user profile information (name and password).
 */
export default function UpdateProfileForm({ user }: UpdateProfileFormProps) {
  const { update: updateSession } = useSession(); // Get session update function

  // Form state
  const [name, setName] = useState(user.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // For displaying persistent errors in the form

  /**
   * Handles form submission for profile updates.
   */
  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setLoading(true);

    // --- Client-side validation ---
    if (newPassword && newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      setLoading(false);
      return;
    }
    if (newPassword && !currentPassword) {
        setError('Current password is required to set a new password.');
        setLoading(false);
        return;
    }
    // --- End validation ---

    try {
      // --- API Call to update profile ---
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          // Only include passwords if a new one is being set
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      // --- End API Call ---

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors (e.g., incorrect password, validation failed server-side)
        const errorMessage = data.error || 'Failed to update profile.';
        setError(errorMessage); // Show error in the form
        toast.error("Update Failed", { description: errorMessage }); // Show error toast
      } else {
        // --- Success Case ---
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');

        // Update local state for the name input field immediately
        if (data.user?.name) {
          setName(data.user.name);
        }

        // Trigger a session update in the background to refresh user data globally
        // This uses the NextAuth `useSession().update()` mechanism
        await updateSession({ name: data.user?.name });

        // Show success toast notification using sonner
        toast.success("Profile Updated", {
          description: "Your profile details have been saved successfully.",
        });
        // --- End Success Case ---
      }
    } catch (err) {
      // Handle unexpected network or other errors during fetch
      console.error('Profile update exception:', err);
      const unexpectedErrorMsg = "An unexpected error occurred.";
      setError(unexpectedErrorMsg);
      toast.error("Update Failed", { description: unexpectedErrorMsg });
    } finally {
      setLoading(false); // Ensure loading state is always turned off
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md border">
      <form onSubmit={handleProfileUpdate} className="space-y-4">
        {/* Name Update Section */}
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            name="name"
            type="text"
            required
            value={name} // Controlled input
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />
        </div>

        <hr className="my-6" />

        {/* Password Change Section */}
        <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
        <p className="text-sm text-gray-500 mb-4">Leave fields blank to keep your current password.</p>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="current-password">Current Password</Label>
          <Input
            id="current-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="confirm-new-password">Confirm New Password</Label>
          <Input
            id="confirm-new-password"
            name="confirmNewPassword"
            type="password"
            autoComplete="new-password"
            value={confirmNewPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmNewPassword(e.target.value)}
          />
        </div>

        {/* Error Message Area */}
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            disabled={loading}
            className="mt-2 w-full"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
} 