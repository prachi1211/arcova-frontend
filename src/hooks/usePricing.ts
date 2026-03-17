import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ─── Raw backend shape ────────────────────────────────────────────────────────

export interface RawPricingRule {
  id: string;
  room_type_id: string;
  name: string;
  rule_type: 'weekend' | 'seasonal' | 'last_minute' | 'occupancy';
  adjustment_type: 'percentage' | 'fixed';
  adjustment_value: number;
  priority: number;
  is_active: boolean;
  days_of_week?: number[];
  date_from?: string;
  date_to?: string;
  days_before_checkin?: number;
  occupancy_threshold?: number;
  created_at: string;
  updated_at: string;
}

export interface PricePreviewPoint {
  date: string;
  baseRateCents: number;
  adjustedRateCents: number;
  adjustmentApplied: boolean;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function usePricingRules(roomTypeId: string) {
  return useQuery({
    queryKey: ['pricing-rules', roomTypeId],
    queryFn: async (): Promise<RawPricingRule[]> => {
      const { data } = await api.get('/pricing/rules', { params: { roomTypeId } });
      return data as RawPricingRule[];
    },
    enabled: !!roomTypeId,
  });
}

export function useCreatePricingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      room_type_id: string;
      name: string;
      rule_type: 'weekend' | 'seasonal' | 'last_minute' | 'occupancy';
      adjustment_type: 'percentage' | 'fixed';
      adjustment_value: number;
      priority?: number;
      days_of_week?: number[];
      date_from?: string;
      date_to?: string;
      days_before_checkin?: number;
      occupancy_threshold?: number;
    }): Promise<RawPricingRule> => {
      const { data } = await api.post('/pricing/rules', input);
      return data as RawPricingRule;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['pricing-rules', vars.room_type_id] });
    },
  });
}

export function useUpdatePricingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      roomTypeId,
      ...input
    }: {
      id: string;
      roomTypeId: string;
      name?: string;
      adjustment_type?: 'percentage' | 'fixed';
      adjustment_value?: number;
      priority?: number;
      is_active?: boolean;
      days_of_week?: number[];
      date_from?: string;
      date_to?: string;
      days_before_checkin?: number;
      occupancy_threshold?: number;
    }): Promise<RawPricingRule> => {
      const { data } = await api.put(`/pricing/rules/${id}`, input);
      return data as RawPricingRule;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['pricing-rules', vars.roomTypeId] });
    },
  });
}

export function useDeletePricingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, roomTypeId }: { id: string; roomTypeId: string }): Promise<void> => {
      await api.delete(`/pricing/rules/${id}`);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['pricing-rules', vars.roomTypeId] });
    },
  });
}

export function usePreviewRates(
  params: { room_type_id: string; start_date: string; end_date: string } | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['pricing-preview', params],
    queryFn: async (): Promise<PricePreviewPoint[]> => {
      const { data } = await api.post('/pricing/preview', params);
      return data as PricePreviewPoint[];
    },
    enabled: enabled && !!params?.room_type_id,
  });
}
