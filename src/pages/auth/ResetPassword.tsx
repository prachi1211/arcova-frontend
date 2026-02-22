import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      // TODO: Extract token from URL params (useSearchParams)
      // TODO: Call POST /api/auth/reset-password with { token, password }
      // TODO: On success, redirect to login with success toast
      console.log('Reset password payload:', data);
      setSuccess(true);
      setTimeout(() => navigate('/auth/login'), 2500);
    } catch {
      setServerError('This reset link is invalid or has expired. Please request a new one.');
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={26} className="text-emerald-600" />
        </div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-navy-950 mb-3">
          Password updated
        </h1>
        <p className="text-sm text-warm-500 leading-relaxed mb-8">
          Your password has been reset successfully. Redirecting you to sign in…
        </p>
        <Link
          to="/auth/login"
          className="inline-flex items-center justify-center h-11 px-8 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-semibold transition-all duration-200"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-navy-950 mb-2">
          Set new password
        </h1>
        <p className="text-sm text-warm-500 leading-relaxed">
          Choose a strong password to secure your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Server error */}
        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {serverError}{' '}
            <Link to="/auth/forgot-password" className="font-semibold underline underline-offset-2">
              Request a new link
            </Link>
          </div>
        )}

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-navy-950">
            New password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className={cn(
                'w-full h-11 rounded-xl border bg-white px-4 pr-11 text-sm text-navy-950 placeholder:text-warm-400 outline-none transition-all duration-200',
                'focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15',
                errors.password
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15'
                  : 'border-warm-200',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
          <p className="text-xs text-warm-400">Min. 8 characters, one uppercase, one number.</p>
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy-950">
            Confirm new password
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className={cn(
                'w-full h-11 rounded-xl border bg-white px-4 pr-11 text-sm text-navy-950 placeholder:text-warm-400 outline-none transition-all duration-200',
                'focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15',
                errors.confirmPassword
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15'
                  : 'border-warm-200',
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-navy-950 text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(212,168,83,0.25)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Updating password…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
