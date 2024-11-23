'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { AnimatedBeam } from '@/components/ui/animated-beam';

const SocialIcon = ({ icon, ref, className }) => {
  return (
    <div
      ref={ref}
      className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white p-2 shadow-lg ${className || ''}`}
    >
      {icon}
    </div>
  );
};

const socialIcons = {
  facebook: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#1877F2]" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#E4405F]" fill="currentColor">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-black" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#0A66C2]" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-black" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  ),
  threads: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-black" fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.535-.021 4.557-.668 6.013-1.924 1.208-1.042 1.993-2.483 2.33-4.288l2.052.536c-.433 2.345-1.454 4.246-3.027 5.648-1.971 1.668-4.537 2.525-7.613 2.55v-.003z"/>
      <path d="M21.207 17.293l-1.414 1.414L12 11.414l-7.793 7.793-1.414-1.414L12 8.586l9.207 9.207z"/>
    </svg>
  )
};

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef(null);
  const centerRef = useRef(null);
  const socialRefs = {
    facebook: useRef(null),
    instagram: useRef(null),
    x: useRef(null),
    linkedin: useRef(null),
    tiktok: useRef(null),
    threads: useRef(null),
  };

  useEffect(() => {
    if (status === 'authenticated') {
      const callbackUrl = searchParams.get('callbackUrl');
      router.push(callbackUrl || '/');
    }
  }, [status, searchParams, router]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: searchParams.get('callbackUrl') || '/' });
  };

  const socialNodes = Object.entries(socialRefs).map(([platform, ref]) => ({
    ref,
    platform
  }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div
        ref={containerRef}
        className="relative flex w-full max-w-[800px] items-center justify-center p-20"
      >
        {/* Left side social icons */}
        <div className="absolute left-10 flex flex-col gap-8">
          <SocialIcon icon={socialIcons.facebook} ref={socialRefs.facebook} />
          <SocialIcon icon={socialIcons.instagram} ref={socialRefs.instagram} />
          <SocialIcon icon={socialIcons.x} ref={socialRefs.x} />
        </div>

        {/* Right side social icons */}
        <div className="absolute right-10 flex flex-col gap-8">
          <SocialIcon icon={socialIcons.linkedin} ref={socialRefs.linkedin} />
          <SocialIcon icon={socialIcons.tiktok} ref={socialRefs.tiktok} />
          <SocialIcon icon={socialIcons.threads} ref={socialRefs.threads} />
        </div>

        {/* Center content */}
        <div 
          ref={centerRef} 
          className="z-10 flex flex-col items-center gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-lg"
        >
          <h1 className="text-4xl font-bold text-slate-900">KNBL SMA</h1>
          <Button
            onClick={handleGoogleSignIn}
            className="mt-4 w-full min-w-[200px] bg-slate-900 text-white hover:bg-slate-800"
          >
            Sign in with Google
          </Button>
        </div>

        <AnimatedBeam
          containerRef={containerRef}
          centerRef={centerRef}
          nodes={socialNodes}
        />
      </div>
    </div>
  );
}
