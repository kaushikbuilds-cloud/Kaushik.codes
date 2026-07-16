import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import {
  fetchAnalytics,
  fetchDashboardStats,
} from '@/services/analytics';

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: fetchDashboardStats,
  });
}

export function useAnalytics(rangeDays = 30) {
  return useQuery({
    queryKey: queryKeys.analytics(String(rangeDays)),
    queryFn: () => fetchAnalytics(rangeDays),
  });
}
