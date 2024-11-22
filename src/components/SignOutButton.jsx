'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await signOut({ 
        redirect: true,
        callbackUrl: '/login'
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="shimmer"
      size="lg"
    >
      Sign Out
    </Button>
  );
}
