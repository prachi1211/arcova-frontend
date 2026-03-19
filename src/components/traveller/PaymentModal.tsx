import { useState, useEffect } from 'react';
import { PaymentElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import type { Appearance } from '@stripe/stripe-js';
import { Loader2, Lock, X, AlertCircle, RefreshCw } from 'lucide-react';
import { stripePromise } from '@/lib/stripe';
import { formatCurrency } from '@/lib/utils';

// ─── Inner checkout form (must be inside <Elements>) ─────────────────────────

interface CheckoutFormProps {
  amountCents: number;
  onSuccess: () => void;
  onClose: () => void;
}

function CheckoutForm({ amountCents, onSuccess, onClose }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  // Detect if stripe failed to load after 3 seconds (missing publishable key)
  const [stripeChecked, setStripeChecked] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStripeChecked(true), 3000);
    return () => clearTimeout(t);
  }, []);

  if (stripeChecked && !stripe) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">Payment system unavailable</p>
            <p className="text-xs text-red-600 mt-0.5">
              Stripe publishable key is not configured. Add{' '}
              <code className="font-mono bg-red-100 px-1 rounded">VITE_STRIPE_PUBLISHABLE_KEY</code>{' '}
              to Vercel and redeploy.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl border border-warm-200 text-sm font-medium text-warm-700 hover:bg-warm-50 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setError('');
    setProcessing(true);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        // Fallback redirect URL — only used for redirect-based payment methods
        return_url: window.location.href,
      },
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed. Please check your card details and try again.');
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    } else {
      setError('Payment did not complete. Please try again.');
    }
    // Note: stripe.confirmPayment can be called again safely — the payment intent is still active.

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: 'tabs',
          defaultValues: { billingDetails: { address: { country: 'US' } } },
        }}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <p className="text-xs text-red-500 mt-1.5 ml-5">
            Your card was not charged. Review your details above and try again.
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="flex-1 h-11 rounded-xl border border-warm-200 text-sm font-medium text-warm-700 hover:bg-warm-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 h-11 rounded-xl bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-navy-950 text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(212,168,83,0.25)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Processing…
            </>
          ) : error ? (
            <>
              <RefreshCw size={13} />
              Try Again
            </>
          ) : (
            <>
              <Lock size={13} />
              Pay {formatCurrency(amountCents)}
            </>
          )}
        </button>
      </div>

      <p className="text-[11px] text-center text-warm-400 flex items-center justify-center gap-1">
        <Lock size={10} />
        Secured by Stripe · Sandbox — no real charges
      </p>
    </form>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  clientSecret: string;
  amountCents: number;
  onSuccess: () => void;
}

const stripeAppearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#D4A853',
    colorBackground: '#ffffff',
    colorText: '#0A0F1E',
    colorDanger: '#DC2626',
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '10px',
  },
  rules: {
    '.Input': { border: '1px solid #E8E8E0', boxShadow: 'none' },
    '.Input:focus': { border: '1px solid #D4A853', boxShadow: '0 0 0 2px rgba(212,168,83,0.15)' },
    '.Label': { color: '#8A8A80', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  },
};

export function PaymentModal({ open, onClose, clientSecret, amountCents, onSuccess }: PaymentModalProps) {
  if (!open || !clientSecret) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-lg font-semibold text-navy-950">Complete Payment</h2>
            <p className="text-sm text-warm-500 mt-0.5">
              Total: <span className="font-semibold text-navy-950">{formatCurrency(amountCents)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-warm-100 hover:bg-warm-200 flex items-center justify-center transition-colors"
            aria-label="Close payment modal"
          >
            <X size={16} className="text-warm-600" />
          </button>
        </div>

        {/* Test card hint */}
        <div className="mb-5 px-3 py-2.5 bg-gold-50 border border-gold-200 rounded-xl">
          <p className="text-xs text-gold-700 font-medium">Sandbox — use card 4242 4242 4242 4242</p>
          <p className="text-[11px] text-gold-600 mt-0.5">Any future expiry · Any 3-digit CVC · Any ZIP</p>
        </div>

        <Elements
          stripe={stripePromise}
          options={{ clientSecret, appearance: stripeAppearance }}
        >
          <CheckoutForm amountCents={amountCents} onSuccess={onSuccess} onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
}
