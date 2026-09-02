import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { KeyRound, Mail, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email Form, 2: OTP Verification Form
  const [otp, setOtp] = useState('');

  const { forgotPassword, verifyOTP, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    const res = await forgotPassword({ email });
    if (res?.success) {
      setStep(2);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const res = await verifyOTP({ email, otp });
    if (res?.success && res.token) {
      navigate(`/reset-password?token=${res.token}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-editorial-accent/10 text-editorial-accent rounded-full flex items-center justify-center mx-auto mb-3">
            {step === 1 ? <KeyRound className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-bold font-serif">
            {step === 1 ? 'Forgot Password' : 'Enter 6-Digit OTP'}
          </h2>
          <p className="text-xs text-editorial-muted dark:text-darkEditorial-muted mt-1">
            {step === 1
              ? 'Enter your email to receive a 6-digit verification code'
              : `We sent a 6-digit OTP code to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-editorial-muted dark:text-darkEditorial-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-editorial-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-editorial-accent hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Sending Code...' : 'Send Verification OTP'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-editorial-accent"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-3 bg-editorial-accent hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Verifying OTP...' : 'Verify OTP & Continue'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 text-xs text-editorial-muted hover:text-editorial-text transition"
            >
              Use a different email address
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
