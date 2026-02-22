import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
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
      // TODO: Call POST /api/auth/login with { email, password }
      // TODO: On success, call useAuthStore.setAuth(user, token)
      // TODO: Redirect based on role → /traveller, /host, /admin
      console.log('Login payload:', data);
      navigate('/');
    } catch {
      setServerError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-navy-950 mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-warm-500">Sign in to continue your journey with Arcova.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Server error */}
        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

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
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-navy-950">
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-medium text-gold-600 hover:text-gold-500 transition-colors"
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
          {errors.password && (
            <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-navy-950 text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(212,168,83,0.25)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-7">
        <div className="flex-1 h-px bg-warm-200" />
        <span className="text-xs text-warm-400 font-medium">or</span>
        <div className="flex-1 h-px bg-warm-200" />
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm text-warm-500">
        Don&apos;t have an account?{' '}
        <Link
          to="/auth/signup"
          className="font-semibold text-navy-950 hover:text-gold-600 transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
