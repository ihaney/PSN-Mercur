'use client'

import { useMutation } from '@tanstack/react-query';
import { trackNotificationDelivery, trackNotificationInteraction } from '@/lib/data/notifications';

/**
 * Hook for tracking notification delivery and interactions
 * Uses Medusa SDK
 */
export function useNotificationDelivery(notificationId?: string) {
  const deliveryMutation = useMutation({
    mutationFn: (id: string) => trackNotificationDelivery(id),
  });

  const interactionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      trackNotificationInteraction(id, action),
  });

  const trackDelivery = (id?: string) => {
    const targetId = id || notificationId;
    if (targetId) {
      deliveryMutation.mutate(targetId);
    }
  };

  const trackInteraction = (action: string, id?: string) => {
    const targetId = id || notificationId;
    if (targetId) {
      interactionMutation.mutate({ id: targetId, action });
    }
  };

  return {
    trackDelivery,
    trackInteraction,
  };
}

