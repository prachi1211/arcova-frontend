import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'What is Arcova and how does it work?',
    answer:
      'Arcova is an AI-powered travel platform that unites travelers, hosts, and administrators in one ecosystem. The name combines Arc (the journey) and Cova (the destination). Simply sign up, tell our AI concierge your preferences, and receive personalized itineraries, curated property recommendations, and seamless booking — all in one place.',
  },
  {
    question: 'How does the AI trip planner create itineraries?',
    answer:
      'Our AI analyzes your travel style, budget, interests, and past preferences to craft bespoke itineraries. It considers local events, seasonal highlights, hidden gems, and logistics to build day-by-day plans that feel personally curated — not algorithmically generated.',
  },
  {
    question: 'Is Arcova free for travelers?',
    answer:
      'Yes, creating an account and planning trips is completely free. You only pay when you book accommodations or experiences. There are no hidden fees — the price you see is the price you pay.',
  },
  {
    question: 'How can I list my property on Arcova?',
    answer:
      "Sign up as a host, and you'll get access to our property management dashboard. Add your property details, room types, photos, and pricing. Our team reviews every listing to maintain quality standards. Once approved, your property is live and bookable.",
  },
  {
    question: 'What analytics tools do hosts get?',
    answer:
      'Hosts receive a comprehensive dashboard with real-time occupancy rates, revenue trends, channel performance, and competitor insights. Our dynamic pricing engine automatically adjusts rates based on demand, seasonality, and market conditions to maximize your revenue.',
  },
  {
    question: 'Is my data secure on Arcova?',
    answer:
      'Absolutely. We use enterprise-grade encryption for all data in transit and at rest. Payment processing is handled through PCI-compliant providers. We never sell your personal data, and you can request full data deletion at any time.',
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    /* No border-b dividers — spacing is the separator (design spec: "No dividers") */
    <div className="py-6 md:py-7">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left gap-6 group"
      >
        <span
          className={cn(
            'text-base md:text-lg font-semibold transition-colors duration-300',
            isOpen ? 'text-gold-400' : 'text-[#e3e3db]/80 group-hover:text-gold-400',
          )}
        >
          {question}
        </span>
        {/* Ghost border chevron button */}
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
            isOpen
              ? 'bg-gold-500 rotate-180'
              : 'bg-[#2f3445] group-hover:bg-[#2f3445] border border-white/[0.08]',
          )}
        >
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-colors duration-300',
              isOpen ? 'text-navy-950' : 'text-[#e3e3db]/50',
            )}
          />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="text-sm md:text-[15px] text-[#e3e3db]/50 leading-relaxed pt-4 pr-14">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    /* surface-low — sits between surface sections */
    <section id="faq" className="relative py-24 md:py-36 bg-[#161b2b] overflow-hidden noise-overlay">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left column — sticky header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease }}
            className="lg:col-span-4 lg:sticky lg:top-32 lg:self-start"
          >
            <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-[0.25em] mb-5 block">
              Common Questions
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-[#e3e3db] leading-[1.1] tracking-tight mb-5">
              Everything You
              <br />
              Need to <span className="italic text-gold-400">Know.</span>
            </h2>
            <p className="text-base text-[#e3e3db]/50 leading-relaxed max-w-sm">
              Have a question that isn&apos;t answered here? Reach out to our team and we&apos;ll
              get back to you within 24 hours.
            </p>
          </motion.div>

          {/* Right column — accordion on surface-high card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="lg:col-span-8"
          >
            {/* surface-high card — tonal lift, no hard border */}
            <div className="bg-[#25293a] rounded-[2rem] px-6 sm:px-8 md:px-10 py-2 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  /* Tonal separation via spacing only — no divider lines */
                  className={cn(index < faqs.length - 1 && 'border-b border-white/[0.05]')}
                >
                  <FAQItem
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openIndex === index}
                    onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
