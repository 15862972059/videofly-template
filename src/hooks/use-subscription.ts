"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/dashboard-client";

export function useSubscriptionStatus(enabled = true) {
  const query = useQuery({
    queryKey: ["subscription-status"],
    queryFn: () => apiClient.getSubscriptionStatus(),
    enabled,
    refetchOnWindowFocus: false,
  });

  const portalMutation = useMutation({
    mutationFn: () => apiClient.createSubscriptionPortal(),
  });

  return {
    ...query,
    openPortal: portalMutation.mutateAsync,
    isOpeningPortal: portalMutation.isPending,
  };
}
