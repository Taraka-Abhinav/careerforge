import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Map, ArrowRight, Shield, Zap, Target } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      <header className="px-6 h-20 flex justify-between items-center border-b border-white/5 bg-neutral-950/80 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
             <Map className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Roadmap<span className="text-indigo-400">AI</span></span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
          <Button onClick={() => navigate('/signup')}>Get Started</Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight max-w-4xl mx-auto mb-6">
          The Intelligent Career Path for Top Tech Talent
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Level up your skills with a personalized roadmap powered by AI. No more guesswork, just pure execution and structured growth.
        </p>
        <Button size="xl" onClick={() => navigate('/signup')} icon={<ArrowRight className="w-5 h-5" />} className="shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)]">
          Build My Roadmap
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto text-left">
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-white/5">
            <Target className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Hyper-Targeted</h3>
            <p className="text-sm text-neutral-400">Curriculums generated instantly for your exact career goals and current skill level.</p>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-white/5">
            <Zap className="w-8 h-8 text-amber-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Active Execution</h3>
            <p className="text-sm text-neutral-400">Daily challenges, real-world sandboxes, and interactive labs to test your knowledge.</p>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-white/5">
            <Shield className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Enterprise-Grade</h3>
            <p className="text-sm text-neutral-400">Secure infrastructure built on Supabase. Your data is isolated, protected, and fully yours.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
