import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import {
  fetchSettings,
  updateSettings,
  type SettingsUpdate,
} from '@/services/settings';

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: SettingsUpdate }) =>
      updateSettings(id, patch),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.settings, data);
    },
  });
}
