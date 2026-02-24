import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, User, MapPin, Plane, Hotel, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const SAMPLE_PROMPTS = [
  'Plan a 7-day trip to Japan for 2 people in April',
  'Best luxury hotels in the Maldives under $500/night',
  'Weekend getaway from London with beaches',
  'Honeymoon itinerary for Santorini and Mykonos',
];

const MOCK_RESPONSE = `I'd love to help you plan that! Here's a curated itinerary:

**Day 1-2: Tokyo — The Modern Gateway**
Arrive at Narita and head to your hotel in Shinjuku. Explore Harajuku, Shibuya crossing, and Meiji Shrine. Dinner at an izakaya in Golden Gai.

**Day 3: Hakone — Mountain Serenity**
Take the romance car train to Hakone for views of Mt. Fuji. Stay at a traditional ryokan with an onsen.

**Day 4-5: Kyoto — Ancient Heart**
The Philosopher's Path, Fushimi Inari, Arashiyama bamboo grove. Kaiseki dinner in Gion.

**Day 6: Nara — Gentle Encounters**
Feed the deer at Todaiji Temple. Day trip from Kyoto.

**Day 7: Osaka — Culinary Capital**
Dotonbori, Kuromon Market, takoyaki and ramen before your flight home.

**Recommended Hotels:**
- 🏨 Aman Tokyo (luxury, from $1,200/night)
- 🏨 Hoshinoya Kyoto (ryokan, from $450/night)
- 🏨 The Ritz-Carlton Osaka (from $380/night)

**Estimated Budget:** $4,500–6,500 per person (flights + hotels + activities)

Want me to search for available hotels on your specific dates?`;

function typewriter(text: string, onUpdate: (partial: string) => void, onDone: () => void) {
  let i = 0;
  const interval = setInterval(() => {
    i += 3;
    onUpdate(text.slice(0, i));
    if (i >= text.length) {
      clearInterval(interval);
      onDone();
    }
  }, 20);
  return () => clearInterval(interval);
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
    };

    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate streaming delay then typewriter
    setTimeout(() => {
      typewriter(
        MOCK_RESPONSE,
        (partial) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: partial } : m)),
          );
        },
        () => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)),
          );
          setIsLoading(false);
        },
      );
    }, 800);
  };

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

  const formatContent = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-navy-950 mt-3 first:mt-0">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('- ') || line.startsWith('🏨 ')) {
          return <p key={i} className="ml-3">{line}</p>;
        }
        if (line === '') return <br key={i} />;
        return <p key={i}>{line}</p>;
      });
  };

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
            <p className="text-xs text-warm-500">Powered by Claude · Plan, discover, explore</p>
          </div>
        </div>
      </div>

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
                  className="text-left px-4 py-3 rounded-xl border border-warm-200 text-sm text-warm-700 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-700 transition-all"
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
                <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm-100 text-xs text-warm-600">
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

                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-navy-950 text-white rounded-tr-sm'
                      : 'bg-white border border-warm-200 text-warm-800 rounded-tl-sm shadow-sm',
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div className="space-y-0.5">
                      {formatContent(msg.content)}
                      {msg.isStreaming && (
                        <span className="inline-block w-0.5 h-4 bg-gold-500 animate-pulse ml-0.5 align-middle" />
                      )}
                    </div>
                  ) : (
                    msg.content
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
            placeholder="Ask me to plan a trip, find hotels, or suggest destinations..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none text-sm text-navy-950 placeholder:text-warm-400 outline-none bg-transparent max-h-[120px] min-h-[36px] leading-relaxed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
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
