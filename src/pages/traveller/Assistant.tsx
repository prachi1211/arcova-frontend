import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Send, User, MapPin, Plane, Hotel, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useTripStore } from '@/stores/tripStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripActivity {
  time: string;
  title: string;
  description: string;
  type: 'activity' | 'meal' | 'transport' | 'accommodation';
  estimatedCost: number;
}

interface TripDay {
  day: number;
  date: string;
  activities: TripActivity[];
}

interface TripPlan {
  destination: string;
  dates: { start: string; end: string };
  budget: { total: number; currency: string };
  suggestedHotelId?: string;
  itinerary: TripDay[];
  tips: string[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  error?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api';

const SAMPLE_PROMPTS = [
  'Plan a 7-day trip to Japan for 2 people in April',
  'Best luxury hotels in Bali under $300/night',
  'Weekend getaway from London with beaches',
  'Honeymoon itinerary for Paris on a $4,000 budget',
];

// ─── SSE helpers ─────────────────────────────────────────────────────────────

async function createSession(token: string): Promise<string> {
  const res = await fetch(`${API_BASE}/chat/new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to start session (${res.status})`);
  const data = await res.json() as { sessionId: string };
  return data.sessionId;
}

async function streamMessage(
  sessionId: string,
  content: string,
  token: string,
  callbacks: {
    onToken: (text: string) => void;
    onTripPlan: (plan: TripPlan) => void;
    onDone: () => void;
    onError: (msg: string) => void;
  },
): Promise<void> {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId, message: content }),
  });

  if (!res.ok || !res.body) {
    callbacks.onError(`Could not reach the AI assistant (${res.status}). Please try again.`);
    callbacks.onDone();
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      // SSE events are separated by double newlines
      const parts = buffer.split('\n\n');
      buffer = parts.pop() ?? ''; // keep any incomplete trailing chunk

      for (const part of parts) {
        for (const line of part.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6)) as {
              type: string;
              content?: string;
              plan?: TripPlan;
            };
            if (event.type === 'token' && event.content) callbacks.onToken(event.content);
            else if (event.type === 'trip_plan' && event.plan) callbacks.onTripPlan(event.plan);
            else if (event.type === 'done') callbacks.onDone();
            else if (event.type === 'error') callbacks.onError(event.content ?? 'An error occurred');
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ─── Markdown-lite renderer ──────────────────────────────────────────────────

function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    if (/^\*\*(.+)\*\*$/.test(line)) {
      return (
        <p key={i} className="font-semibold text-navy-950 mt-3 first:mt-0">
          {line.replace(/\*\*/g, '')}
        </p>
      );
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <p key={i} className="ml-3 text-warm-700">
          {line}
        </p>
      );
    }
    if (line.startsWith('**') && line.includes('**')) {
      // Inline bold fragments
      const parts = line.split(/\*\*/);
      return (
        <p key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j} className="text-navy-950">{part}</strong> : part,
          )}
        </p>
      );
    }
    if (line === '') return <br key={i} />;
    return <p key={i} className="text-warm-800">{line}</p>;
  });
}

// ─── Trip Plan Panel ──────────────────────────────────────────────────────────

function TripPlanPanel({ plan }: { plan: TripPlan }) {
  const nights = Math.round(
    (new Date(plan.dates.end).getTime() - new Date(plan.dates.start).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <div className="mt-4 rounded-2xl border border-gold-200 bg-gold-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-950 to-navy-800 px-4 py-3">
        <div className="flex items-center gap-2 mb-0.5">
          <MapPin size={14} className="text-gold-400" />
          <span className="font-heading font-semibold text-white text-sm">{plan.destination}</span>
        </div>
        <p className="text-xs text-white/60">
          {plan.dates.start} → {plan.dates.end} · {nights} nights ·{' '}
          {plan.budget.currency} {plan.budget.total.toLocaleString()} budget
        </p>
      </div>

      {/* Itinerary */}
      <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
        {plan.itinerary.map((day) => (
          <div key={day.day}>
            <p className="text-xs font-semibold text-navy-950 mb-1.5">
              Day {day.day} — {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
            <div className="space-y-1">
              {day.activities.map((act, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="text-warm-400 w-10 shrink-0">{act.time}</span>
                  <div>
                    <span className="font-medium text-navy-950">{act.title}</span>
                    {act.estimatedCost > 0 && (
                      <span className="ml-1 text-warm-500">(${act.estimatedCost})</span>
                    )}
                    <p className="text-warm-500">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      {plan.tips.length > 0 && (
        <div className="border-t border-gold-200 px-4 py-3">
          <p className="text-xs font-semibold text-navy-950 mb-1">Travel Tips</p>
          <ul className="space-y-0.5">
            {plan.tips.map((tip, i) => (
              <li key={i} className="text-xs text-warm-600">· {tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Assistant() {
  const { token } = useAuthStore();
  const { items: tripItems } = useTripStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialising, setIsInitialising] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prefillDone = useRef(false);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create chat session when the component mounts
  useEffect(() => {
    if (!token) return;
    setIsInitialising(true);
    createSession(token)
      .then((id) => setSessionId(id))
      .catch(() => setSessionError('Could not connect to the AI assistant. Please refresh and try again.'))
      .finally(() => setIsInitialising(false));
  }, [token]);

  // Pre-populate input with trip context once session is ready
  useEffect(() => {
    if (!sessionId || prefillDone.current) return;
    const hotels = tripItems.filter((i) => i.type === 'hotel');
    if (hotels.length === 0) return;
    prefillDone.current = true;
    const names = hotels.map((h) => `${h.name} (${h.subtitle.split(' · ')[0]})`).join(', ');
    const prompt =
      hotels.length === 1
        ? `I've added ${names} to my trip. Help me plan my stay — what should I do, see, and eat nearby?`
        : `I've added these hotels to my trip: ${names}. Help me plan a multi-destination itinerary.`;
    setInput(prompt);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [sessionId, tripItems]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || isLoading || !sessionId || !token) return;

      const userMsgId = Date.now().toString();
      const assistantMsgId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: 'user', content: content.trim() },
        { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true },
      ]);
      setInput('');
      setIsLoading(true);

      streamMessage(sessionId, content.trim(), token, {
        onToken: (text) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: m.content + text } : m,
            ),
          );
        },
        onTripPlan: (plan) => {
          setTripPlan(plan);
        },
        onDone: () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, isStreaming: false } : m,
            ),
          );
          setIsLoading(false);
        },
        onError: (msg) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: msg, isStreaming: false, error: true }
                : m,
            ),
          );
          setIsLoading(false);
        },
      });
    },
    [sessionId, token, isLoading],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const canSend = !!sessionId && !isLoading && !isInitialising && !!input.trim();

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
            <Sparkles size={18} className="text-gold-500" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-navy-950">
              AI Travel Assistant
            </h1>
            <p className="text-xs text-warm-500">
              {isInitialising ? 'Connecting…' : sessionId ? 'Ready · Powered by Gemini' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Session error */}
      {sessionError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4 shrink-0">
          <AlertCircle size={15} />
          {sessionError}
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center pb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mb-5 shadow-lg">
              <Sparkles size={28} className="text-navy-950" />
            </div>
            <h2 className="font-heading text-xl font-semibold text-navy-950 mb-2">
              Plan your perfect trip
            </h2>
            <p className="text-sm text-warm-500 max-w-sm mb-8">
              Tell me where you want to go and I'll create a personalised itinerary with hotel
              recommendations, day-by-day activities, and budget estimates.
            </p>

            {/* Quick prompts */}
            <div className="grid sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={!sessionId || isInitialising}
                  className="text-left px-4 py-3 rounded-xl border border-warm-200 text-sm text-warm-700 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {[
                { icon: MapPin, label: 'Itineraries' },
                { icon: Hotel, label: 'Hotel picks' },
                { icon: Plane, label: 'Flight advice' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm-100 text-xs text-warm-600"
                >
                  <Icon size={11} /> {label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles size={14} className="text-gold-500" />
                  </div>
                )}

                <div className="max-w-[85%]">
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-navy-950 text-white rounded-tr-sm'
                        : msg.error
                          ? 'bg-red-50 border border-red-200 text-red-700 rounded-tl-sm'
                          : 'bg-white border border-warm-200 text-warm-800 rounded-tl-sm shadow-sm',
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="space-y-0.5">
                        {renderContent(msg.content)}
                        {msg.isStreaming && (
                          <span className="inline-block w-0.5 h-4 bg-gold-500 animate-pulse ml-0.5 align-middle" />
                        )}
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* Trip plan card — rendered below the assistant message that triggered it */}
                  {msg.role === 'assistant' && !msg.isStreaming && tripPlan && (
                    <TripPlanPanel plan={tripPlan} />
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-navy-950 flex items-center justify-center shrink-0 mt-1">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 bg-white rounded-2xl border border-warm-200 shadow-sm p-3">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isInitialising
                ? 'Connecting to AI assistant…'
                : sessionError
                  ? 'Connection failed — please refresh'
                  : 'Ask me to plan a trip, find hotels, or suggest destinations…'
            }
            rows={1}
            disabled={isLoading || isInitialising || !!sessionError}
            className="flex-1 resize-none text-sm text-navy-950 placeholder:text-warm-400 outline-none bg-transparent max-h-[120px] min-h-[36px] leading-relaxed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="w-9 h-9 rounded-xl bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-navy-950 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 hover:shadow-[0_0_15px_rgba(212,168,83,0.3)]"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </form>
        <p className="text-xs text-warm-400 mt-2 text-center">
          AI responses are for planning purposes. Always verify hotel availability before booking.
        </p>
      </div>
    </div>
  );
}
