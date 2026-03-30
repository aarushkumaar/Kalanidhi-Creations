'use client';
import { useAdmin } from '@/utils/firebase/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/admin/login');
      } else if (!isAdmin) {
        // Signed in but not an admin — boot them out
        import('@/utils/firebase/config')
          .then(({ auth }) => import('firebase/auth')
            .then(({ signOut }) => signOut(auth)))
          .then(() => {
            router.push('/admin/login?error=unauthorized');
            router.refresh();
          });
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4" />
        <p className="uppercase tracking-[0.2em] text-xs text-gold animate-pulse">Verifying Access</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row relative z-[99999]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
