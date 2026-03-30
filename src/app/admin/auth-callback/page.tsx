'use client';
import { auth } from '@/utils/firebase/config';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from '@/components/ui/Toast';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const email = window.localStorage.getItem('emailForSignIn') || '';
      
      signInWithEmailLink(auth, email, window.location.href)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
          toast('Successfully signed in!', 'success');
          router.push('/admin');
        })
        .catch((err) => {
          console.error(err);
          toast('Invalid or expired link.', 'error');
          router.push('/admin/login?error=invalid-link');
        });
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4" />
      <p className="uppercase tracking-[0.2em] text-xs text-gold animate-pulse">Authenticating</p>
    </div>
  );
}
