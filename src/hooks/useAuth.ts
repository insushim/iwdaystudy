'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth(requireAuth = false) {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [requireAuth, isAuthenticated, isLoading, router]);

  return { user, isAuthenticated, isLoading, logout };
}

export function useRequireRole(role: string) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user && user.role !== role && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, isAuthenticated, role, router]);

  return { user, isAuthenticated };
}
