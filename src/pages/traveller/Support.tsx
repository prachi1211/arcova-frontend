import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquarePlus, Clock, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMyTickets, useCreateTicket } from '@/hooks/useSupport';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { SupportTicketStatus, SupportTicketPriority } from '@/types';

const schema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Please describe your issue in more detail').max(5000),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});
type FormData = z.infer<typeof schema>;

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

export default function Support() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useMyTickets();
  const createTicket = useCreateTicket();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium' },
  });

  const onSubmit = async (values: FormData) => {
    try {
      await createTicket.mutateAsync(values);
      toast({ title: 'Ticket submitted', description: 'Our team will get back to you shortly.' });
      form.reset();
      setShowForm(false);
    } catch {
      toast({ title: 'Failed to submit', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const tickets = data?.results ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-semibold tracking-tight text-[#0A0F1E]">
            Contact Support
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Have an issue? Our team is here to help.
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="bg-[#D4A853] hover:bg-[#E2BC6A] text-[#0A0F1E] font-medium"
        >
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* New ticket form */}
      {showForm && (
        <Card className="border border-[#E8E8E0] shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="font-playfair text-lg font-semibold text-[#0A0F1E]">
              Submit a Support Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0A0F1E] mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  {...form.register('subject')}
                  placeholder="Brief description of your issue"
                  className="w-full rounded-md border border-[#E8E8E0] bg-white px-3 py-2 text-sm text-[#1A1A18] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4A853] focus:border-transparent"
                />
                {form.formState.errors.subject && (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A0F1E] mb-1">
                  Priority
                </label>
                <select
                  {...form.register('priority')}
                  className="w-full rounded-md border border-[#E8E8E0] bg-white px-3 py-2 text-sm text-[#1A1A18] focus:outline-none focus:ring-2 focus:ring-[#D4A853]"
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
                  {...form.register('message')}
                  rows={5}
                  placeholder="Describe your issue in detail..."
                  className="w-full rounded-md border border-[#E8E8E0] bg-white px-3 py-2 text-sm text-[#1A1A18] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4A853] focus:border-transparent resize-none"
                />
                {form.formState.errors.message && (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.message.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  type="submit"
                  disabled={createTicket.isPending}
                  className="bg-[#D4A853] hover:bg-[#E2BC6A] text-[#0A0F1E] font-medium"
                >
                  {createTicket.isPending ? 'Submitting...' : 'Submit Ticket'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); form.reset(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Ticket history */}
      <Card className="border border-[#E8E8E0] shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="font-playfair text-lg font-semibold text-[#0A0F1E]">
            My Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquarePlus className="h-8 w-8 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-medium text-[#0A0F1E]">No tickets yet</p>
              <p className="text-sm text-slate-500 mt-1">Submit a ticket above if you need help.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => {
                const Icon = STATUS_ICONS[ticket.status];
                const isExpanded = expandedId === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    className="rounded-lg border border-[#E8E8E0] overflow-hidden"
                  >
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
                        <Badge className={cn('text-xs border', STATUS_STYLES[ticket.status])}>
                          {STATUS_LABELS[ticket.status]}
                        </Badge>
                        <Badge className={cn('text-xs border', PRIORITY_STYLES[ticket.priority])}>
                          {ticket.priority}
                        </Badge>
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
                          <div className="rounded-md bg-[#D4A853]/10 border border-[#D4A853]/30 p-3">
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
        </CardContent>
      </Card>
    </div>
  );
}
