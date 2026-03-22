import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Check, X, MapPin, User, AlertTriangle } from 'lucide-react';
import { useAdminProperties, useAdminStats, useUpdatePropertyStatus } from '@/hooks/useAdmin';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { PropertyStatus } from '@/types';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending Review', value: 'pending_review' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

interface RejectModalProps {
  propertyName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}

function RejectModal({ propertyName, onConfirm, onCancel, isPending }: RejectModalProps) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <X size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-heading text-base font-semibold text-navy-950">Reject Property</h3>
            <p className="text-sm text-warm-500 mt-0.5">
              Rejecting <span className="font-medium text-navy-950">"{propertyName}"</span>
            </p>
          </div>
        </div>

        <div className="space-y-1.5 mb-5">
          <label className="block text-sm font-medium text-navy-950">
            Reason for rejection <span className="text-warm-400 font-normal">(shown to host)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Missing property photos, incomplete address, misleading description..."
            rows={3}
            className="w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm text-navy-950 placeholder:text-warm-400 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15 resize-none transition-all"
          />
          <p className="text-xs text-warm-400">{reason.length}/500</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-warm-200 text-sm font-medium text-warm-700 hover:bg-warm-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {isPending ? 'Rejecting…' : 'Reject Property'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProperties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') ?? '';
  const [page, setPage] = useState(0);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useAdminProperties({
    status: statusFilter || undefined,
    page,
    limit: 20,
  });
  const { data: platformStats } = useAdminStats();

  const updateStatus = useUpdatePropertyStatus();

  const properties = data?.results ?? [];

  function setStatus(value: string) {
    setPage(0);
    if (value) setSearchParams({ status: value });
    else setSearchParams({});
  }

  function handleApprove(id: string) {
    updateStatus.mutate({ id, status: 'active' });
  }

  function handleRejectConfirm(reason: string) {
    if (!rejectTarget) return;
    updateStatus.mutate(
      { id: rejectTarget.id, status: 'inactive', rejectionReason: reason || undefined },
      { onSuccess: () => setRejectTarget(null) },
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Properties"
        description="Review and manage all property listings on the platform."
      />

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors',
              statusFilter === tab.value
                ? 'bg-navy-950 text-white'
                : 'bg-white border border-warm-200 text-warm-700 hover:border-warm-300',
            )}
          >
            {tab.label}
            {tab.value === 'pending_review' && (platformStats?.pendingProperties ?? 0) > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gold-500 text-navy-950 text-[10px] font-bold">
                {platformStats!.pendingProperties}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 border-b border-warm-100 animate-pulse bg-warm-50" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties found"
          description={statusFilter ? `No ${statusFilter.replace('_', ' ')} properties.` : 'No properties on the platform yet.'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_120px_160px] gap-4 px-5 py-3 bg-warm-50 border-b border-warm-200 text-xs font-semibold text-warm-500 uppercase tracking-wide">
            <span>Property</span>
            <span>Host</span>
            <span>Location</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-warm-100">
            {properties.map((p) => (
              <div key={p.id} className="px-5 py-4">
                {/* Mobile layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-navy-950 text-sm">{p.name}</p>
                      <p className="text-xs text-warm-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {p.city}, {p.country}
                      </p>
                    </div>
                    <StatusBadge status={p.status as PropertyStatus} />
                  </div>
                  <p className="text-xs text-warm-500 flex items-center gap-1">
                    <User size={10} /> {p.host?.fullName ?? '—'} · {p.host?.email ?? '—'}
                  </p>
                  {p.status === 'pending_review' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(p.id)}
                        disabled={updateStatus.isPending}
                        className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                      >
                        <Check size={13} /> Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget({ id: p.id, name: p.name })}
                        className="flex-1 h-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <X size={13} /> Reject
                      </button>
                    </div>
                  )}
                  {p.status === 'inactive' && p.rejectionReason && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      <span className="font-medium">Rejection reason:</span> {p.rejectionReason}
                    </p>
                  )}
                  {p.status === 'active' && (
                    <button
                      onClick={() => updateStatus.mutate({ id: p.id, status: 'inactive' })}
                      disabled={updateStatus.isPending}
                      className="h-8 px-4 rounded-lg border border-warm-200 text-xs font-medium text-warm-700 hover:bg-warm-50 transition-colors disabled:opacity-60"
                    >
                      Deactivate
                    </button>
                  )}
                </div>

                {/* Desktop layout */}
                <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_120px_160px] gap-4 items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-950 truncate">{p.name}</p>
                    <p className="text-xs text-warm-400 mt-0.5">{p.totalRooms} rooms · {formatDate(p.createdAt)}</p>
                    {p.status === 'inactive' && p.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1 flex items-start gap-1">
                        <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                        <span className="truncate">{p.rejectionReason}</span>
                      </p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-navy-950 truncate">{p.host?.fullName ?? '—'}</p>
                    <p className="text-xs text-warm-400 truncate">{p.host?.email ?? '—'}</p>
                  </div>

                  <p className="text-sm text-warm-700 truncate">
                    {p.city}, {p.country}
                  </p>

                  <StatusBadge status={p.status as PropertyStatus} />

                  <div className="flex items-center justify-end gap-2">
                    {p.status === 'pending_review' && (
                      <>
                        <button
                          onClick={() => handleApprove(p.id)}
                          disabled={updateStatus.isPending}
                          className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-60"
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectTarget({ id: p.id, name: p.name })}
                          className="h-8 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <X size={12} /> Reject
                        </button>
                      </>
                    )}
                    {p.status === 'active' && (
                      <button
                        onClick={() => updateStatus.mutate({ id: p.id, status: 'inactive' })}
                        disabled={updateStatus.isPending}
                        className="h-8 px-3 rounded-lg border border-warm-200 text-xs font-medium text-warm-700 hover:bg-warm-50 transition-colors disabled:opacity-60"
                      >
                        Deactivate
                      </button>
                    )}
                    {p.status === 'inactive' && (
                      <button
                        onClick={() => handleApprove(p.id)}
                        disabled={updateStatus.isPending}
                        className="h-8 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-medium transition-colors disabled:opacity-60"
                      >
                        Re-activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {(data?.totalCount ?? 0) > 20 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-warm-100">
              <p className="text-xs text-warm-500">
                Showing {page * 20 + 1}–{Math.min((page + 1) * 20, data!.totalCount)} of {data!.totalCount}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="h-8 px-3 rounded-lg border border-warm-200 text-xs font-medium text-warm-700 hover:bg-warm-50 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data?.hasNextPage}
                  className="h-8 px-3 rounded-lg border border-warm-200 text-xs font-medium text-warm-700 hover:bg-warm-50 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          propertyName={rejectTarget.name}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
          isPending={updateStatus.isPending}
        />
      )}
    </div>
  );
}
