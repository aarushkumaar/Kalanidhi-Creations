'use client';
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './config';
import { isAdminEmail } from '@/config/admins';

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}

export function useAdmin() {
  const { user, loading } = useAuth();
  const isAdmin = user ? isAdminEmail(user.email ?? '') : false;
  return { user, isAdmin, loading };
}
