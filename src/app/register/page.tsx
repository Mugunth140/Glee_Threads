'use client';

import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name);
      router.push('/products');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-1 mb-10">
          <Image 
            src="/glee_logo.png" 
            alt="Glee Logo" 
            width={32} 
            height={32}
            className="object-contain"
          />
          <span className="text-3xl font-extrabold text-black" style={{ fontFamily: 'var(--font-figtree)' }}>lee Threads</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-black mb-2">Create an account</h1>
          <p className="text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-black font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:bg-white transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:bg-white transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:bg-white transition-all"
              placeholder="Min. 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-black focus:bg-white transition-all"
              placeholder="Confirm your password"
            />
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              required
              className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <label htmlFor="terms" className="text-sm text-gray-500">
              I agree to the{' '}
              <Link href="/terms" className="text-black hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-black hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-4 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Security Note */}
        <p className="mt-8 text-center text-xs text-gray-400">
          Your password is securely encrypted and stored safely.
        </p>
      </div>
    </div>
  );
}
