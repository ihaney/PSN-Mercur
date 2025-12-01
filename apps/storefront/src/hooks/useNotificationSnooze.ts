'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSnoozedNotifications, snoozeNotification, unsnoozeNotification } from '@/lib/data/notifications';

/**
 * Hook for notification snooze functionality
 * Uses Medusa SDK
 */
export function useNotificationSnooze() {
  const queryClient = useQueryClient();

  const { data: snoozedNotifications = [] } = useQuery({
    queryKey: ['snoozedNotifications'],
    queryFn: async () => {
      const result = await getSnoozedNotifications();
      return result.notifications || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const snoozeMutation = useMutation({
    mutationFn: ({ id, until }: { id: string; until: string }) => 
      snoozeNotification(id, until),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['snoozedNotifications'] });
    },
  });

  const unsnoozeMutation = useMutation({
    mutationFn: (id: string) => unsnoozeNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['snoozedNotifications'] });
    },
  });

  const isSnoozed = (id: string) => snoozedNotifications.some(n => n.id === id);
  
  const getSnoozedInfo = (id: string) => 
    snoozedNotifications.find(n => n.id === id);

  const getTimeUntilUnsnooze = (id: string) => {
    const info = getSnoozedInfo(id);
    if (!info?.snooze_until) return null;
    return new Date(info.snooze_until);
  };

  return {
    snoozedNotifications,
    isSnoozed,
    getSnoozedInfo,
    snoozeNotification: snoozeMutation.mutate,
    unsnoozeNotification: unsnoozeMutation.mutate,
    getTimeUntilUnsnooze,
  };
}

