'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  archiveNotification,
  deleteNotification,
} from '@/lib/data/notifications';

/**
 * Hook for notifications
 * Uses Medusa SDK
 */
export function useNotifications(filters?: {
  type?: string
  read?: boolean
  archived?: boolean
}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const result = await getNotifications(filters);
      return result.notifications || [];
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 30000, // Poll every 30 seconds for real-time updates
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = query.data?.filter(n => !n.read_at).length || 0;

  return {
    ...query,
    notifications: query.data || [],
    unreadCount,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
    archive: archiveMutation.mutate,
    delete: deleteMutation.mutate,
  };
}

