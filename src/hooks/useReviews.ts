import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Review, PaginatedResponse } from '@/types';

interface RawReview {
  id: string;
  booking_id: string;
  traveller_id: string;
  property_id: string;
  rating: number;
  comment: string | null;
  host_response: string | null;
  created_at: string;
  traveller?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

function toReview(raw: RawReview): Review {
  return {
    id: raw.id,
    bookingId: raw.booking_id,
    travellerId: raw.traveller_id,
    propertyId: raw.property_id,
    rating: raw.rating,
    comment: raw.comment ?? undefined,
    hostResponse: raw.host_response ?? undefined,
    createdAt: raw.created_at,
    traveller: raw.traveller
      ? {
          id: raw.traveller.id,
          fullName: raw.traveller.full_name ?? undefined,
          avatarUrl: raw.traveller.avatar_url ?? undefined,
        }
      : undefined,
  };
}

export function usePropertyReviews(propertyId: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['reviews', propertyId, params],
    queryFn: async (): Promise<PaginatedResponse<Review>> => {
      const { data } = await api.get('/reviews', {
        params: { propertyId, page: params?.page ?? 0, limit: params?.limit ?? 20 },
      });
      return {
        results: (data.results as RawReview[]).map(toReview),
        totalCount: data.totalCount as number,
        page: data.page as number,
        pageSize: data.pageSize as number,
        hasNextPage: data.hasNextPage as boolean,
      };
    },
    enabled: !!propertyId,
  });
}

export function useRespondToReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }): Promise<Review> => {
      const { data } = await api.patch(`/reviews/${id}/response`, { response });
      return toReview(data as RawReview);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
