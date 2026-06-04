'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Mail, Github, Twitter, Instagram, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Dynamically import LightRays with SSR disabled since it uses WebGL/Canvas
const LightRays = dynamic(() => import('@/components/LightRays'), { ssr: false });

const calculateTimeLeft = (targetDate: Date) => {
  const difference = +targetDate - +new Date();
  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  return timeLeft;
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [targetDate] = useState(() => {
    // Set launch date to exactly July 3, 2026 (1 month from today, June 3, 2026)
    return new Date('2026-07-03T21:30:00+05:30');
  });

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      setTimeout(() => {
        setError(null);
      }, 5000);
      return;
    }

    // Check localStorage for duplicate submissions on this device
    try {
      const subbedEmails = JSON.parse(localStorage.getItem('subscribed_emails') || '[]');
      if (subbedEmails.includes(normalizedEmail)) {
        setError('You have already subscribed with this email!');
        // Clear error message after 5 seconds
        setTimeout(() => {
          setError(null);
        }, 5000);
        return;
      }
    } catch (err) {
      console.error('Error reading from localStorage:', err);
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setEmail('');

        // Save to localStorage to prevent future submissions of this email
        try {
          const subbedEmails = JSON.parse(localStorage.getItem('subscribed_emails') || '[]');
          if (!subbedEmails.includes(normalizedEmail)) {
            subbedEmails.push(normalizedEmail);
            localStorage.setItem('subscribed_emails', JSON.stringify(subbedEmails));
          }
        } catch (err) {
          console.error('Error saving to localStorage:', err);
        }

        // Clear success message and restore form after 5 seconds
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        // Clear error message after 5 seconds
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (err) {
      setError('Failed to connect to the server. Please check your connection.');
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="relative min-h-screen md:h-screen w-full flex flex-col items-center justify-between bg-[#030303] text-white overflow-y-auto md:overflow-hidden font-sans">
      {/* Light Rays Background Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={0.5}
          lightSpread={1.5}
          rayLength={1.8}
          pulsating={true}
          followMouse={true}
          mouseInfluence={0.08}
          distortion={0.1}
          className="absolute inset-0 opacity-80"
        />
        {/* Additional premium glowing gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none z-0" />
      </div>

      {/* Header */}
      <header className="relative w-full max-w-7xl mx-auto px-6 py-4 md:py-8 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">KAIFCODER™</span>
        </div>
        
        <div className="flex gap-4">
          <a href="https://github.com/WebDev-Coder1" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors duration-200" title="GitHub">
            <Github className="size-5" />
          </a>
          <a href="https://x.com/Kaif_Coder99" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors duration-200" title="X (Twitter)">
            <Twitter className="size-5" />
          </a>
          <a href="https://www.instagram.com/kaif_coder?igsh=MTQ1N2RjNHpmc2o5Mw==" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors duration-200" title="Instagram">
            <Instagram className="size-5" />
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto z-10 py-6 md:py-12 w-full">
        {/* Launch Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-indigo-300 mb-4 md:mb-8 animate-pulse shadow-inner shadow-white/[0.02]">
          <span className="size-1.5 rounded-full bg-indigo-400" />
          👨‍💻 PORTFOLIO LAUNCHING SOON
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-zinc-500 max-w-3xl leading-[1.1]">
          Full-Stack & AI Developer
        </h1>

        <p className="text-zinc-400 text-sm md:text-lg max-w-2xl mb-6 md:mb-12 font-light leading-relaxed">
          Building high-performance web applications and intelligent AI integrations. Portfolio launching soon.
        </p>

        {/* Countdown Timer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-16 max-w-2xl w-full px-4">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds }
          ].map((item, idx) => (
            <div key={idx} className="relative group overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.05] p-3 sm:p-4 md:p-6 backdrop-blur-md transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.03]">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
              <div className="text-3xl md:text-5xl font-mono font-bold tracking-tight mb-1 text-zinc-100">
                {mounted ? String(item.value).padStart(2, '0') : '--'}
              </div>
              <div className="text-[10px] md:text-sm text-zinc-500 uppercase tracking-widest font-medium">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Waitlist Subscription Form */}
        <div className="w-full max-w-lg px-4">
          {submitted ? (
            <div className="relative overflow-hidden bg-white/[0.02] border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-md shadow-2xl shadow-emerald-950/20 animate-fadeIn">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
              <div className="flex flex-col items-center gap-3">
                <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-100">Subscription Confirmed</h3>
                <p className="text-zinc-400 text-sm max-w-sm leading-relaxed">
                  Thank you! I will notify you immediately at <span className="text-indigo-300 font-semibold">{email}</span> when my portfolio goes live.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative p-[1px] rounded-2xl overflow-hidden bg-gradient-to-b from-white/[0.08] to-transparent shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />
              <div className="relative bg-[#08080c]/85 backdrop-blur-xl p-4 sm:p-5 rounded-[15px] flex flex-col gap-3">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="Enter your email address"
                      required
                      value={email}
                      disabled={loading}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/[0.01] border border-white/[0.08] rounded-xl text-white placeholder-zinc-500 outline-none focus:border-indigo-400/80 focus:ring-2 focus:ring-indigo-400/10 transition-all duration-300 text-sm backdrop-blur-sm disabled:opacity-50"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-indigo-400 pointer-events-none z-10" />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="relative overflow-hidden h-auto py-3.5 px-6 bg-white hover:bg-zinc-100 text-black rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 border-0 shadow-lg shadow-white/5 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="size-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-1" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Notified</span>
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </Button>
                </form>
                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-400 text-left pl-1 mt-1 animate-fadeIn">
                    <span className="size-1.5 rounded-full bg-red-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative w-full max-w-7xl mx-auto px-6 py-4 md:py-8 text-center text-zinc-600 text-xs z-10 shrink-0">
        &copy; {new Date().getFullYear()} kaifcoder.in. All rights reserved.
      </footer>
    </div>
  );
}
