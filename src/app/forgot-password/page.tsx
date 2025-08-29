'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    if (!email) {
      setError('Please enter your email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Please check your inbox (and spam folder).');
    } catch (err: any) {
      // Handle Firebase errors
      if (err.code === 'auth/user-not-found') {
        // For security, you can show a generic message
        setError('If an account with that email exists, a reset link has been sent.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('An error occurred. Please try again later.');
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url('/background.png')` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M17 17h.01" />
          </svg>
          <span className="text-white text-xl font-bold">TODO</span>
        </div>
        <nav>
          <Link href="/" className="text-white hover:text-red-400 transition-colors">
            Back to Login
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative bg-white p-6 sm:p-10 rounded-lg shadow-2xl w-full max-w-md z-10">
        
        <div className="flex justify-center mb-6">
          <img
            src="/icons/icon.png"
            alt="Profile Icon"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Reset Your Password</h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your email address and we will send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-800 placeholder-gray-500"
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md">
              <p className="text-sm">{message}</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-3 rounded-md font-bold text-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-red-500 hover:underline text-sm">
            ← Back to Login
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 flex flex-col md:flex-row justify-between items-center z-10 text-gray-400 text-sm gap-4 md:gap-0">
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms Of Use</a>
        </div>
        <div className="flex items-center flex-col sm:flex-row gap-4">
          <span>© 2025 Key. All Rights Reserved | Design By STAUMZ</span>
        </div>
      </footer>
    </div>
  );
}
