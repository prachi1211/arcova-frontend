import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    // TODO: Call POST /api/auth/forgot-password with { email }
    // TODO: Backend sends reset email via Supabase
    console.log('Forgot password payload:', data);
    setSubmittedEmail(data.email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gold-100 flex items-center justify-center mx-auto mb-6">
          <MailCheck size={26} className="text-gold-600" />
        </div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-navy-950 mb-3">
          Check your inbox
        </h1>
        <p className="text-sm text-warm-500 leading-relaxed mb-2">
          We&apos;ve sent a password reset link to
        </p>
        <p className="text-sm font-semibold text-navy-950 mb-8">{submittedEmail}</p>
        <p className="text-xs text-warm-400 mb-8 leading-relaxed">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <button
            onClick={() => setSubmitted(false)}
            className="text-gold-600 hover:text-gold-500 font-medium transition-colors"
          >
            try again
          </button>
          .
        </p>
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-navy-950 hover:text-gold-600 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-navy-950 mb-2">
          Forgot password?
        </h1>
        <p className="text-sm text-warm-500 leading-relaxed">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-navy-950">
            Email address
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={cn(
              'w-full h-11 rounded-xl border bg-white px-4 text-sm text-navy-950 placeholder:text-warm-400 outline-none transition-all duration-200',
              'focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15',
              errors.email
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15'
                : 'border-warm-200',
            )}
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-navy-950 text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(212,168,83,0.25)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      {/* Back to login */}
      <div className="mt-8 text-center">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-navy-950 hover:text-gold-600 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
