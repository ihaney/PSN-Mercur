'use client'

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';
import { getCurrentUser } from '@/lib/data/user-actions';
import { createClientSupabaseClient } from '@/lib/supabase-client';

interface AdminRouteProps {
  children: React.ReactNode;
  locale?: string;
}

export default function AdminRoute({ children, locale }: AdminRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Extract locale from pathname if not provided
  const detectedLocale = locale || (pathname?.split('/')[1] || 'en');

  const { data: isAdmin, isLoading, error } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return false;

      const supabase = createClientSupabaseClient();
      if (!supabase) {
        console.error('Supabase not configured');
        return false;
      }

      const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false
  });

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      toast.error('Failed to verify admin access');
      router.push(`/${detectedLocale}`);
      return;
    }

    if (isAdmin === false) {
      toast.error('Unauthorized: Admin access required');
      router.push(`/${detectedLocale}`);
    }
  }, [isAdmin, isLoading, error, router, detectedLocale]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
        <p className="ml-4 text-gray-600 dark:text-gray-400">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
