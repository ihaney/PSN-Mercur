'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getNotificationGroups, 
  toggleNotificationGroupExpanded, 
  markNotificationGroupAsRead 
} from '@/lib/data/notifications';

/**
 * Hook for notification groups functionality
 * Uses Medusa SDK
 */
export function useNotificationGroups() {
  const queryClient = useQueryClient();

  const { data: groups = [] } = useQuery({
    queryKey: ['notificationGroups'],
    queryFn: async () => {
      const result = await getNotificationGroups();
      return result.groups || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const toggleExpandedMutation = useMutation({
    mutationFn: ({ groupId, expanded }: { groupId: string; expanded: boolean }) =>
      toggleNotificationGroupExpanded(groupId, expanded),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationGroups'] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (groupId: string) => markNotificationGroupAsRead(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationGroups'] });
    },
  });

  const toggleExpanded = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      toggleExpandedMutation.mutate({ 
        groupId, 
        expanded: !group.expanded 
      });
    }
  };

  const markGroupAsRead = (groupId: string) => {
    markAsReadMutation.mutate(groupId);
  };

  return {
    groups,
    toggleExpanded,
    markGroupAsRead,
  };
}

