import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { supabase } from '../supabase/client';
import { Map, ArrowRight } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Typically, wait for email confirmation, or if auto-confirm is on, redirect to welcome
      navigate('/welcome');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md bg-neutral-900/60 border border-white/10 rounded-3xl p-8 backdrop-blur-md z-10 relative">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
             <Map className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-bold text-white tracking-tight">Roadmap<span className="text-indigo-400">AI</span></span>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-6">Create Account</h2>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">{error}</div>}
          
          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 w-full" 
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 w-full" 
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" size="lg" className="w-full mt-2 bg-purple-600 hover:bg-purple-500" disabled={loading} icon={<ArrowRight className="w-4 h-4" />}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-sm text-neutral-500 text-center mt-6">
          Already have an account? <button onClick={() => navigate('/login')} className="text-purple-400 font-bold hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  );
}
