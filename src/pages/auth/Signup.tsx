import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const schema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    role: z.enum(['traveller', 'host'], { error: 'Please select a role' }),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

const ROLES = [
  { value: 'traveller', label: 'Traveller', desc: 'Search, plan and book trips' },
  { value: 'host', label: 'Host', desc: 'List and manage properties' },
] as const;

export default function Signup() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const selectedRole = watch('role');

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const response = await api.post('/auth/signup', {
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        role: data.role,
      });

      const { user, session, profile } = response.data;

      if (session?.access_token) {
        setAuth(
          { id: user.id, email: user.email, role: user.role, fullName: profile?.full_name ?? data.fullName },
          session.access_token,
        );
        navigate(user.role === 'traveller' ? '/traveller' : '/host');
      } else {
        // Email confirmation required
        setEmailSent(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setServerError(msg);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <Check size={24} className="text-emerald-400" />
        </div>
        <h1 className="font-heading text-2xl font-semibold text-[#e3e3db] mb-2">Check your inbox</h1>
        <p className="text-sm text-[#e3e3db]/55 mb-6">
          We sent a confirmation link to your email. Click it to activate your account.
        </p>
        <Link
          to="/auth/login"
          style={{ background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[#0e1322] text-sm font-semibold transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#e3e3db] mb-2">
          Create your account
        </h1>
        <p className="text-sm text-[#e3e3db]/55">Join Arcova and start your journey today.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Server error */}
        {serverError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {serverError}
          </div>
        )}

        {/* Role selector */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#e3e3db]/80">I want to</label>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setValue('role', r.value, { shouldValidate: true })}
                className={cn(
                  'flex flex-col items-start gap-0.5 rounded-xl border p-4 text-left transition-all duration-200',
                  selectedRole === r.value
                    ? 'border-gold-500/50 bg-gold-500/[0.08] ring-1 ring-gold-500/20'
                    : 'border-white/[0.08] bg-[#25293a] hover:border-white/[0.15]',
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold text-[#e3e3db]">{r.label}</span>
                  {selectedRole === r.value && (
                    <span className="w-4 h-4 rounded-full bg-gold-500 flex items-center justify-center">
                      <Check size={10} className="text-[#0e1322]" strokeWidth={3} />
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#e3e3db]/45">{r.desc}</span>
              </button>
            ))}
          </div>
          {errors.role && <p className="text-xs text-red-400">{errors.role.message}</p>}
        </div>

        {/* Full name */}
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="block text-sm font-medium text-[#e3e3db]/80">
            Full name
          </label>
          <input
            {...register('fullName')}
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            className={cn(
              'w-full h-11 rounded-xl border bg-[#25293a] px-4 text-sm text-[#e3e3db] placeholder:text-[#e3e3db]/30 outline-none transition-all duration-200',
              'focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20',
              errors.fullName ? 'border-red-500/40 focus:border-red-500/40 focus:ring-red-500/15' : 'border-white/[0.08]',
            )}
          />
          {errors.fullName && <p className="text-xs text-red-400">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-[#e3e3db]/80">
            Email address
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={cn(
              'w-full h-11 rounded-xl border bg-[#25293a] px-4 text-sm text-[#e3e3db] placeholder:text-[#e3e3db]/30 outline-none transition-all duration-200',
              'focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20',
              errors.email ? 'border-red-500/40 focus:border-red-500/40 focus:ring-red-500/15' : 'border-white/[0.08]',
            )}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-[#e3e3db]/80">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className={cn(
                'w-full h-11 rounded-xl border bg-[#25293a] px-4 pr-11 text-sm text-[#e3e3db] placeholder:text-[#e3e3db]/30 outline-none transition-all duration-200',
                'focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20',
                errors.password ? 'border-red-500/40 focus:border-red-500/40 focus:ring-red-500/15' : 'border-white/[0.08]',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#e3e3db]/40 hover:text-[#e3e3db]/70 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#e3e3db]/80">
            Confirm password
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className={cn(
                'w-full h-11 rounded-xl border bg-[#25293a] px-4 pr-11 text-sm text-[#e3e3db] placeholder:text-[#e3e3db]/30 outline-none transition-all duration-200',
                'focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20',
                errors.confirmPassword ? 'border-red-500/40 focus:border-red-500/40 focus:ring-red-500/15' : 'border-white/[0.08]',
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#e3e3db]/40 hover:text-[#e3e3db]/70 transition-colors"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' }}
          className="w-full h-11 rounded-xl text-[#0e1322] text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(212,168,83,0.25)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-xs text-[#e3e3db]/35 text-center leading-relaxed">
          By creating an account you agree to our{' '}
          <a href="#" className="text-[#e3e3db]/60 underline underline-offset-2 hover:text-gold-400">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-[#e3e3db]/60 underline underline-offset-2 hover:text-gold-400">
            Privacy Policy
          </a>
          .
        </p>
      </form>

      {/* Sign in link */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-white/[0.08]" />
        <span className="text-xs text-[#e3e3db]/35 font-medium">or</span>
        <div className="flex-1 h-px bg-white/[0.08]" />
      </div>

      <p className="text-center text-sm text-[#e3e3db]/50">
        Already have an account?{' '}
        <Link
          to="/auth/login"
          className="font-semibold text-[#e3e3db] hover:text-gold-400 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
