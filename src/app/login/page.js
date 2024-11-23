'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === 'authenticated') {
      const callbackUrl = searchParams.get('callbackUrl') || '/app';
      router.push(callbackUrl);
    }
  }, [status, router, searchParams]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn('google', {
        redirect: true,
        callbackUrl: '/app',
      });
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center font-geist-mono">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-geist-mono">
      <div className="max-w-md w-full space-y-8 p-10 bg-card rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
            KNBL SMA
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <Button
            onClick={handleGoogleSignIn}
            variant="shimmer"
            size="lg"
            className="w-full"
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
