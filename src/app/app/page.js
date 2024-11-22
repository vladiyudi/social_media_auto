'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SignOutButton from '@/components/SignOutButton';
import Campaigns from '@/components/Campaigns';

export default function AppPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center font-geist-mono">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen p-8 font-geist-mono bg-background">
      <div className="flex justify-between items-center mb-8">
        {session?.user?.name && (
          <div className="text-lg text-foreground">
            Welcome, {session.user.name}!
          </div>
        )}
        <SignOutButton />
      </div>

      <Campaigns />
    </div>
  );
}
