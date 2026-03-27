import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/stores/authStore';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

const ROLE_HOME: Record<UserRole, string> = {
  traveller: '/traveller',
  host: '/host',
  admin: '/admin',
};

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;

      const session = authData.session!;

      // Fetch role and profile from the profiles table via backend
      const { data: profile } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const role: UserRole = (profile.role as UserRole) ?? 'traveller';

      setAuth(
        {
          id: session.user.id,
          email: session.user.email!,
          role,
          fullName: profile.full_name as string | undefined,
        },
        session.access_token,
      );

      const redirect = searchParams.get('redirect');
      navigate(redirect ?? ROLE_HOME[role]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password.';
      setServerError(msg);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#e3e3db] mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-[#e3e3db]/55">Sign in to continue your journey with Arcova.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Server error */}
        {serverError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {serverError}
          </div>
        )}

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
              errors.email
                ? 'border-red-500/40 focus:border-red-500/40 focus:ring-red-500/15'
                : 'border-white/[0.08]',
            )}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-[#e3e3db]/80">
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-medium text-gold-400 hover:text-gold-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={cn(
                'w-full h-11 rounded-xl border bg-[#25293a] px-4 pr-11 text-sm text-[#e3e3db] placeholder:text-[#e3e3db]/30 outline-none transition-all duration-200',
                'focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20',
                errors.password
                  ? 'border-red-500/40 focus:border-red-500/40 focus:ring-red-500/15'
                  : 'border-white/[0.08]',
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
          {errors.password && (
            <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
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
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-7">
        <div className="flex-1 h-px bg-white/[0.08]" />
        <span className="text-xs text-[#e3e3db]/35 font-medium">or</span>
        <div className="flex-1 h-px bg-white/[0.08]" />
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm text-[#e3e3db]/50">
        Don&apos;t have an account?{' '}
        <Link
          to="/auth/signup"
          className="font-semibold text-[#e3e3db] hover:text-gold-400 transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
