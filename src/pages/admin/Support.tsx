import { useState } from 'react';
import { AlertCircle, Clock, CheckCircle2, ChevronDown, User, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAdminTickets, useUpdateTicket } from '@/hooks/useSupport';
import { cn } from '@/lib/utils';
import type { SupportTicketStatus, SupportTicketPriority } from '@/types';

const STATUS_STYLES: Record<SupportTicketStatus, string> = {
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const STATUS_ICONS: Record<SupportTicketStatus, typeof Clock> = {
  open: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle2,
  closed: CheckCircle2,
};

const PRIORITY_STYLES: Record<SupportTicketPriority, string> = {
  low: 'bg-slate-100 text-slate-600 border-slate-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-600 border-red-200',
};

const STATUS_FILTERS: { label: string; value: SupportTicketStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

const INPUT_CLASS =
  'w-full rounded-lg border border-[#E8E8E0] bg-white px-3 py-2 text-sm text-[#1A1A18] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4A853] focus:border-transparent';

export default function AdminSupport() {
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const { data, isLoading } = useAdminTickets({ status: statusFilter });
  const updateTicket = useUpdateTicket();

  const tickets = data?.results ?? [];

  const handleStatusChange = async (ticketId: string, status: SupportTicketStatus) => {
    await updateTicket.mutateAsync({ id: ticketId, status });
  };

  const handleSaveNotes = async (ticketId: string, currentNotes: string | null) => {
    setSavingId(ticketId);
    try {
      await updateTicket.mutateAsync({ id: ticketId, admin_notes: notes[ticketId] ?? currentNotes ?? '' });
      setSavedId(ticketId);
      setTimeout(() => setSavedId(null), 2000);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Inbox"
        description={`${data?.totalCount ?? 0} total tickets`}
      />

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
              statusFilter === f.value
                ? 'bg-[#0A0F1E] text-white border-[#0A0F1E]'
                : 'bg-white text-[#334155] border-[#E8E8E0] hover:border-[#0A0F1E]',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[#E8E8E0] bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-[#E8E8E0]">
          <h2 className="font-playfair text-lg font-semibold text-[#0A0F1E]">Tickets</h2>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No tickets found"
              description={statusFilter ? `No ${STATUS_LABELS[statusFilter].toLowerCase()} tickets.` : 'All clear!'}
            />
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => {
                const Icon = STATUS_ICONS[ticket.status];
                const isExpanded = expandedId === ticket.id;
                return (
                  <div key={ticket.id} className="rounded-lg border border-[#E8E8E0] overflow-hidden">
                    <button
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#FAFAF8] transition-colors"
                      onClick={() => {
                        setExpandedId(isExpanded ? null : ticket.id);
                        if (!notes[ticket.id] && ticket.admin_notes) {
                          setNotes((prev) => ({ ...prev, [ticket.id]: ticket.admin_notes ?? '' }));
                        }
                      }}
                    >
                      <Icon className={cn('h-4 w-4 flex-shrink-0', {
                        'text-blue-500': ticket.status === 'open',
                        'text-amber-500': ticket.status === 'in_progress',
                        'text-emerald-500': ticket.status === 'resolved' || ticket.status === 'closed',
                      })} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0A0F1E] truncate">{ticket.subject}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {ticket.user_role === 'host'
                            ? <Building2 className="h-3 w-3 text-slate-400" />
                            : <User className="h-3 w-3 text-slate-400" />
                          }
                          <span className="text-xs text-slate-500 capitalize">{ticket.user_role}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">
                            {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', STATUS_STYLES[ticket.status])}>
                          {STATUS_LABELS[ticket.status]}
                        </span>
                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', PRIORITY_STYLES[ticket.priority])}>
                          {ticket.priority}
                        </span>
                        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', isExpanded && 'rotate-180')} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-[#E8E8E0] bg-[#FAFAF8] space-y-4 pt-4">
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Message from {ticket.user_role}</p>
                          <p className="text-sm text-[#1A1A18] whitespace-pre-wrap">{ticket.message}</p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-slate-500">Update status:</span>
                          {(['open', 'in_progress', 'resolved', 'closed'] as SupportTicketStatus[]).map((s) => (
                            <button
                              key={s}
                              disabled={ticket.status === s || updateTicket.isPending}
                              onClick={() => handleStatusChange(ticket.id, s)}
                              className={cn(
                                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                                ticket.status === s
                                  ? STATUS_STYLES[s]
                                  : 'bg-white border-[#E8E8E0] text-slate-600 hover:border-[#0A0F1E]',
                              )}
                            >
                              {STATUS_LABELS[s]}
                            </button>
                          ))}
                        </div>

                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Response / internal notes</p>
                          <textarea
                            rows={3}
                            value={notes[ticket.id] ?? ticket.admin_notes ?? ''}
                            onChange={(e) => setNotes((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                            placeholder="Add a response or internal note..."
                            className={cn(INPUT_CLASS, 'resize-none')}
                          />
                          <button
                            onClick={() => handleSaveNotes(ticket.id, ticket.admin_notes)}
                            disabled={savingId === ticket.id}
                            className="mt-2 px-4 py-1.5 rounded-lg bg-[#D4A853] hover:bg-[#E2BC6A] text-[#0A0F1E] text-sm font-medium transition-colors disabled:opacity-60"
                          >
                            {savingId === ticket.id ? 'Saving...' : savedId === ticket.id ? 'Saved ✓' : 'Save Response'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
