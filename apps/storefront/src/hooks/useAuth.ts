'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signIn, signUp, signOut as signOutAction } from '@/lib/data/auth';
import { useRouter } from 'next/navigation';

/**
 * Hook for authentication
 * Uses Medusa SDK
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.refresh();
    },
  });

  const signUpMutation = useMutation({
    mutationFn: ({ email, password, metadata }: { email: string; password: string; metadata?: any }) =>
      signUp(email, password, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.refresh();
    },
  });

  const signOutMutation = useMutation({
    mutationFn: () => signOutAction(),
    onSuccess: () => {
      queryClient.clear();
      router.push('/');
      router.refresh();
    },
  });

  return {
    signIn: (params: { email: string; password: string }, callbacks?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      signInMutation.mutate(params, {
        onSuccess: () => {
          queryClient.invalidateQueries();
          router.refresh();
          callbacks?.onSuccess?.();
        },
        onError: callbacks?.onError,
      });
    },
    signUp: (params: { email: string; password: string; metadata?: any }, callbacks?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      signUpMutation.mutate(params, {
        onSuccess: () => {
          queryClient.invalidateQueries();
          router.refresh();
          callbacks?.onSuccess?.();
        },
        onError: callbacks?.onError,
      });
    },
    signOut: () => {
      signOutMutation.mutate();
    },
    isLoading: signInMutation.isPending || signUpMutation.isPending || signOutMutation.isPending,
    signInError: signInMutation.error,
    signUpError: signUpMutation.error,
  };
}

