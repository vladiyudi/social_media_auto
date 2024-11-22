'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/app');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center font-geist-mono bg-background">
      <div className="text-xl text-foreground">Redirecting...</div>
    </div>
  );
}