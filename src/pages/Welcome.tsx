import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Map, Rocket, CheckCircle } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-xl text-center z-10 relative">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Welcome to Roadmap<span className="text-indigo-400">AI</span></h1>
        <p className="text-lg text-neutral-400 mb-10 leading-relaxed">
          Your account has been successfully created. The next step is to calibrate your personal career trajectory. This 3-minute onboarding wizard will configure your entire platform.
        </p>

        <Button size="xl" onClick={() => navigate('/onboarding')} icon={<Rocket className="w-6 h-6" />} className="w-full max-w-sm shadow-[0_0_40px_rgba(79,70,229,0.4)]">
          Start Calibration Wizard
        </Button>
      </div>
    </div>
  );
}
