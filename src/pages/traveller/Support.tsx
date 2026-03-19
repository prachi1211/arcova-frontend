import { useState } from 'react';
import { MessageSquarePlus, Clock, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useMyTickets, useCreateTicket } from '@/hooks/useSupport';
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

const INPUT_CLASS =
  'w-full rounded-lg border border-[#E8E8E0] bg-white px-3 py-2 text-sm text-[#1A1A18] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4A853] focus:border-transparent';

export default function Support() {
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<SupportTicketPriority>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data, isLoading } = useMyTickets();
  const createTicket = useCreateTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (subject.trim().length < 3) { setErrorMsg('Subject must be at least 3 characters.'); return; }
    if (message.trim().length < 10) { setErrorMsg('Please describe your issue in more detail.'); return; }
    setSubmitting(true);
    try {
      await createTicket.mutateAsync({ subject: subject.trim(), message: message.trim(), priority });
      setSuccessMsg('Ticket submitted. Our team will get back to you shortly.');
      setSubject(''); setMessage(''); setPriority('medium');
      setShowForm(false);
    } catch {
      setErrorMsg('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const tickets = data?.results ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Support"
        description="Have an issue? Our team is here to help."
        actions={
          <button
            onClick={() => { setShowForm((v) => !v); setSuccessMsg(''); setErrorMsg(''); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4A853] hover:bg-[#E2BC6A] text-[#0A0F1E] text-sm font-medium transition-colors"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Ticket
          </button>
        }
      />

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-[#E8E8E0] bg-white shadow-sm p-6 space-y-4">
          <h2 className="font-playfair text-lg font-semibold text-[#0A0F1E]">Submit a Support Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0A0F1E] mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A0F1E] mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as SupportTicketPriority)}
                className={INPUT_CLASS}
              >
                <option value="low">Low — general question</option>
                <option value="medium">Medium — something isn't working</option>
                <option value="high">High — urgent issue affecting my booking</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A0F1E] mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Describe your issue in detail..."
                className={cn(INPUT_CLASS, 'resize-none')}
              />
            </div>
            {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-[#D4A853] hover:bg-[#E2BC6A] text-[#0A0F1E] text-sm font-medium transition-colors disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setErrorMsg(''); }}
                className="px-5 py-2 rounded-lg border border-[#E8E8E0] text-sm font-medium text-slate-600 hover:border-slate-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-[#E8E8E0] bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-[#E8E8E0]">
          <h2 className="font-playfair text-lg font-semibold text-[#0A0F1E]">My Tickets</h2>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <EmptyState
              icon={MessageSquarePlus}
              title="No tickets yet"
              description="Submit a ticket above if you need help."
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
                      onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                    >
                      <Icon className={cn('h-4 w-4 flex-shrink-0', {
                        'text-blue-500': ticket.status === 'open',
                        'text-amber-500': ticket.status === 'in_progress',
                        'text-emerald-500': ticket.status === 'resolved' || ticket.status === 'closed',
                      })} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0A0F1E] truncate">{ticket.subject}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
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
                      <div className="px-4 pb-4 border-t border-[#E8E8E0] bg-[#FAFAF8] space-y-3 pt-3">
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Your message</p>
                          <p className="text-sm text-[#1A1A18] whitespace-pre-wrap">{ticket.message}</p>
                        </div>
                        {ticket.admin_notes && (
                          <div className="rounded-lg bg-[#D4A853]/10 border border-[#D4A853]/30 p-3">
                            <p className="text-xs font-medium text-[#B8923F] mb-1">Admin response</p>
                            <p className="text-sm text-[#1A1A18] whitespace-pre-wrap">{ticket.admin_notes}</p>
                          </div>
                        )}
                        {ticket.resolved_at && (
                          <p className="text-xs text-slate-400">
                            Resolved on {new Date(ticket.resolved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
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
