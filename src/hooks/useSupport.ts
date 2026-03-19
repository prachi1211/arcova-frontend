import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SupportTicket, SupportTicketStatus, SupportTicketPriority, PaginatedResponse } from '@/types';

// ─── User hooks (traveller + host) ────────────────────────────────────────────

export function useMyTickets(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['support', 'my', params],
    queryFn: async (): Promise<PaginatedResponse<SupportTicket>> => {
      const { data } = await api.get('/support', { params });
      return data;
    },
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      subject: string;
      message: string;
      priority?: SupportTicketPriority;
    }) => api.post('/support', input).then((r) => r.data as SupportTicket),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support', 'my'] });
    },
  });
}

// ─── Admin hooks ──────────────────────────────────────────────────────────────

export function useAdminTickets(params?: { status?: SupportTicketStatus; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['support', 'admin', params],
    queryFn: async (): Promise<PaginatedResponse<SupportTicket>> => {
      const { data } = await api.get('/support/admin', { params });
      return data;
    },
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...updates
    }: {
      id: string;
      status?: SupportTicketStatus;
      admin_notes?: string;
      priority?: SupportTicketPriority;
    }) => api.patch(`/support/admin/${id}`, updates).then((r) => r.data as SupportTicket),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support', 'admin'] });
    },
  });
}
