import { useState } from 'react';
import { AlertCircle, Clock, CheckCircle2, ChevronDown, User, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminTickets, useUpdateTicket } from '@/hooks/useSupport';
import { useToast } from '@/hooks/use-toast';
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
  medium: 'bg-gold-100 text-[#B8923F] border-gold-300',
  high: 'bg-red-50 text-red-600 border-red-200',
};

const STATUS_FILTERS: { label: string; value: SupportTicketStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

export default function AdminSupport() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data, isLoading } = useAdminTickets({ status: statusFilter });
  const updateTicket = useUpdateTicket();

  const tickets = data?.results ?? [];

  const handleStatusChange = async (ticketId: string, status: SupportTicketStatus) => {
    try {
      await updateTicket.mutateAsync({ id: ticketId, status });
      toast({ title: 'Ticket updated' });
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const handleSaveNotes = async (ticketId: string) => {
    try {
      await updateTicket.mutateAsync({ id: ticketId, admin_notes: notes[ticketId] ?? '' });
      toast({ title: 'Notes saved' });
    } catch {
      toast({ title: 'Failed to save notes', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-semibold tracking-tight text-[#0A0F1E]">
          Support Inbox
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {data?.totalCount ?? 0} total tickets
        </p>
      </div>

      {/* Status filter tabs */}
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

      <Card className="border border-[#E8E8E0] shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="font-playfair text-lg font-semibold text-[#0A0F1E]">
            Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-300 mb-3" />
              <p className="text-sm font-medium text-[#0A0F1E]">No tickets found</p>
              <p className="text-sm text-slate-500 mt-1">
                {statusFilter ? `No ${STATUS_LABELS[statusFilter].toLowerCase()} tickets.` : 'All clear!'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => {
                const Icon = STATUS_ICONS[ticket.status];
                const isExpanded = expandedId === ticket.id;
                return (
                  <div key={ticket.id} className="rounded-lg border border-[#E8E8E0] overflow-hidden">
                    {/* Row header */}
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
                          {ticket.user_role === 'host' ? (
                            <Building2 className="h-3 w-3 text-slate-400" />
                          ) : (
                            <User className="h-3 w-3 text-slate-400" />
                          )}
                          <span className="text-xs text-slate-500 capitalize">{ticket.user_role}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">
                            {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={cn('text-xs border', STATUS_STYLES[ticket.status])}>
                          {STATUS_LABELS[ticket.status]}
                        </Badge>
                        <Badge className={cn('text-xs border', PRIORITY_STYLES[ticket.priority])}>
                          {ticket.priority}
                        </Badge>
                        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', isExpanded && 'rotate-180')} />
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-[#E8E8E0] bg-[#FAFAF8] space-y-4 pt-4">
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Message from {ticket.user_role}</p>
                          <p className="text-sm text-[#1A1A18] whitespace-pre-wrap">{ticket.message}</p>
                        </div>

                        {/* Status changer */}
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
                                  ? cn(STATUS_STYLES[s], 'opacity-100')
                                  : 'bg-white border-[#E8E8E0] text-slate-600 hover:border-[#0A0F1E]',
                              )}
                            >
                              {STATUS_LABELS[s]}
                            </button>
                          ))}
                        </div>

                        {/* Admin notes */}
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Admin response / notes</p>
                          <textarea
                            rows={3}
                            value={notes[ticket.id] ?? ticket.admin_notes ?? ''}
                            onChange={(e) => setNotes((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                            placeholder="Add a response or internal note..."
                            className="w-full rounded-md border border-[#E8E8E0] bg-white px-3 py-2 text-sm text-[#1A1A18] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4A853] resize-none"
                          />
                          <Button
                            size="sm"
                            className="mt-2 bg-[#D4A853] hover:bg-[#E2BC6A] text-[#0A0F1E] font-medium"
                            onClick={() => handleSaveNotes(ticket.id)}
                            disabled={updateTicket.isPending}
                          >
                            Save Response
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
