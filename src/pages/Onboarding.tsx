import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Target, BrainCircuit, Sliders, BookOpen, Clock, Smile, Flame, Github, CheckCircle, Fingerprint, ArrowRight, Sparkles, Check, GraduationCap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { UserProfile, INITIAL_BASELINE_PROFILE, SKILL_TAXONOMY } from '../types';
import { CAREER_OPTIONS } from '../config/careers';
import { cn } from '../utils/cn';
import { ProfileService } from '../services/profileService';
import { ProgressService } from '../services/progressService';
import { RoadmapEngine } from '../services/roadmapEngine';
import { MissionService } from '../services/missionService';
import { GoalService } from '../services/goalService';
import { ChallengeService } from '../services/challengeService';
import { supabase } from '../supabase/client';

const ONBOARDING_STEP_TITLES: Record<number, string> = {
  1: 'Your profile',
  2: 'Education & background',
  3: 'Dream career',
  4: 'Skills you already know',
  5: 'Skills you want to master',
  6: 'Learning style',
  7: 'Study schedule',
  8: 'Learning preference',
  9: 'Timeline commitment',
  10: 'Experience & GitHub',
  11: 'Review & launch',
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ ...INITIAL_BASELINE_PROFILE });
  const totalSteps = 11;
  const navigate = useNavigate();

  const nextStep = () => { if (step < totalSteps) setStep(step + 1); };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const handleFinish = async () => {
    setIsAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const numStartingSkills = profile.skills.known.length;
      const computedReadiness = Math.min(15 + numStartingSkills * 10, 85);
      const computedConfidence = Math.min(40 + numStartingSkills * 10, 95);
      
      const finishedProfile: UserProfile = { 
        ...profile, 
        isComplete: true,
        analysis: {
          readinessScore: computedReadiness,
          learningSpeedScore: profile.personality.learningSpeed === 'Fast' ? 90 : 70,
          confidenceScore: computedConfidence
        }
      };

      await ProfileService.saveProfile(user.id, finishedProfile);
      await ProgressService.ensureProgress(user.id);
      await RoadmapEngine.generateAndPersist(user.id, finishedProfile);
      await MissionService.generateDailyMissions(user.id);
      await GoalService.generateWeeklyGoal(user.id);
      await ChallengeService.assignDailyChallenges(user.id);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
    }
  };

  const handleSkip = async () => {
    if (!profile.basic.name.trim() || !profile.goals.career) {
      alert('Please enter your name and select a career goal before continuing.');
      return;
    }
    await handleFinish();
  };

  const renderStepContent = () => {
    switch(step) {
      case 1: return (
        <div className="space-y-6 animate-fade-in-up">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <User className="text-indigo-400 w-8 h-8"/> Let's build your profile
            </h2>
            <p className="text-neutral-400 text-sm">Tell us about yourself to tailor your learning journey.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-neutral-400 block mb-1">Full Name *</label>
              <input type="text" placeholder="Alex Developer" required className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 w-full" value={profile.basic.name} onChange={e => setProfile({...profile, basic: {...profile.basic, name: e.target.value}})} />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1">City & Country</label>
              <input type="text" placeholder="San Francisco, CA" className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 w-full" value={profile.basic.location} onChange={e => setProfile({...profile, basic: {...profile.basic, location: e.target.value}})} />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1">Age</label>
              <input type="number" placeholder="24" className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 w-full" value={profile.basic.age || ''} onChange={e => setProfile({...profile, basic: {...profile.basic, age: parseInt(e.target.value) || 24}})} />
            </div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-6 animate-fade-in-up">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="text-blue-400 w-8 h-8"/> Education & background
            </h2>
            <p className="text-neutral-400 text-sm">Help us personalize your career path.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-neutral-400 block mb-1">Education Level</label>
              <input type="text" placeholder="B.S. Computer Science" className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white w-full focus:outline-none focus:border-indigo-500" value={profile.basic.education} onChange={e => setProfile({...profile, basic: {...profile.basic, education: e.target.value}})} />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1">College / University</label>
              <input type="text" placeholder="State University" className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white w-full focus:outline-none focus:border-indigo-500" value={profile.basic.school} onChange={e => setProfile({...profile, basic: {...profile.basic, school: e.target.value}})} />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1">Graduation Year</label>
              <input type="text" placeholder="2025" className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white w-full focus:outline-none focus:border-indigo-500" value={profile.basic.gradYear} onChange={e => setProfile({...profile, basic: {...profile.basic, gradYear: e.target.value}})} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-neutral-400 block mb-1">Current Occupation</label>
              <input type="text" placeholder="Student / Software Engineer" className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white w-full focus:outline-none focus:border-indigo-500" value={profile.basic.occupation} onChange={e => setProfile({...profile, basic: {...profile.basic, occupation: e.target.value}})} />
            </div>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-6 animate-fade-in-up">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Target className="text-pink-400 w-8 h-8"/> What is your dream career?
            </h2>
            <p className="text-neutral-400 text-sm">Choose target goals. We optimize systems for this career path.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            {CAREER_OPTIONS.map((role) => (
              <div
                key={role.id}
                className={cn(
                  'p-4 rounded-xl border cursor-pointer transition-all min-h-[80px] flex flex-col justify-center',
                  profile.goals.career === role.label
                    ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]'
                    : 'bg-neutral-900 border-white/10 text-neutral-400 hover:border-white/30'
                )}
                onClick={() => setProfile({ ...profile, goals: { ...profile.goals, career: role.label } })}
              >
                <span className="font-bold text-sm block mb-1">{role.label}</span>
                <span className="text-[10px] text-neutral-500 leading-snug">{role.description}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1">Target Salary (USD)</label>
              <input type="text" placeholder="e.g. $140,000" className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white w-full focus:outline-none focus:border-indigo-500" value={profile.goals.salary} onChange={e => setProfile({...profile, goals: {...profile.goals, salary: e.target.value}})} />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1">Dream Target Company</label>
              <input type="text" placeholder="e.g. OpenAI, Stripe" className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white w-full focus:outline-none focus:border-indigo-500" value={profile.goals.dreamCompany} onChange={e => setProfile({...profile, goals: {...profile.goals, dreamCompany: e.target.value}})} />
            </div>
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-6 animate-fade-in-up">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="text-emerald-400 w-8 h-8"/> Skills you already know
            </h2>
            <p className="text-neutral-400 text-sm">Select baseline skills to calibrate starting level.</p>
          </div>
          <div className="space-y-4">
            {SKILL_TAXONOMY.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{cat.category}</span>
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map(skill => {
                    const isSelected = profile.skills.known.find(s => s.name === skill);
                    return (
                      <div key={skill} className={cn("px-4 py-2 rounded-xl border cursor-pointer text-sm font-medium transition-all flex items-center gap-2", isSelected ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-neutral-900 border-white/5 text-neutral-400 hover:bg-neutral-800")}
                        onClick={() => {
                          let newKnown = [...profile.skills.known];
                          if (isSelected) newKnown = newKnown.filter(s => s.name !== skill);
                          else newKnown.push({ name: skill, level: 'Advanced' });
                          setProfile({...profile, skills: {...profile.skills, known: newKnown}});
                        }}
                      >
                        {skill} {isSelected && <Check className="w-4 h-4"/>}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      case 5: return (
        <div className="space-y-6 animate-fade-in-up">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Sliders className="text-amber-400 w-8 h-8"/> Skills you want to master
            </h2>
            <p className="text-neutral-400 text-sm">Select targeted skills to unlock in the path.</p>
          </div>
          <div className="space-y-4">
            {SKILL_TAXONOMY.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{cat.category}</span>
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map(skill => {
                    const isSelected = profile.skills.learning.find(s => s.name === skill);
                    return (
                      <div key={skill} className={cn("px-4 py-2 rounded-xl border cursor-pointer text-sm font-medium transition-all flex items-center gap-2", isSelected ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-neutral-900 border-white/5 text-neutral-400 hover:bg-neutral-800")}
                        onClick={() => {
                          let newLearn = [...profile.skills.learning];
                          if (isSelected) newLearn = newLearn.filter(s => s.name !== skill);
                          else newLearn.push({ name: skill, priority: 'Must Learn' });
                          setProfile({...profile, skills: {...profile.skills, learning: newLearn}});
                        }}
                      >
                        {skill} {isSelected && <Sparkles className="w-4 h-4 text-indigo-400"/>}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      case 6: return (
        <div className="space-y-6 animate-fade-in-up">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-purple-400 w-8 h-8"/> Choose your learning style
            </h2>
            <p className="text-neutral-400 text-sm">Select study formats matching your personality.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Videos & Lectures', desc: 'Visual screen guides & statistical breakdown series.' },
              { label: 'Interactive Exercises', desc: 'Duolingo-style coding blocks and in-browser terminals.' },
              { label: 'Projects & Building', desc: 'Creating raw functional pipelines from ground level.' },
              { label: 'Reading Documentation', desc: 'System specifications, reference guides, and technical code.' }
            ].map(style => {
              const isSelected = profile.learningStyle.includes(style.label);
              return (
                <Card key={style.label} padding="p-5" className={cn("cursor-pointer border text-left", isSelected ? "border-indigo-500 bg-indigo-500/10" : "border-white/5 hover:border-white/20")}
                  onClick={() => {
                    let styles = [...profile.learningStyle];
                    if (isSelected) styles = styles.filter(s => s !== style.label);
                    else styles.push(style.label);
                    setProfile({...profile, learningStyle: styles});
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white text-sm">{style.label}</span>
                    <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center", isSelected ? "border-indigo-500 bg-indigo-500" : "border-neutral-700")}>
                      {isSelected && <Check className="w-3 h-3 text-white"/>}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400">{style.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      );
      case 7: return (
        <div className="space-y-6 animate-fade-in-up">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Clock className="text-emerald-400 w-8 h-8"/> Study allocation schedule
            </h2>
            <p className="text-neutral-400 text-sm">Assign dedicated time slots for training.</p>
          </div>
          <Card padding="p-6" hover={false} className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2 text-neutral-400">
                <span>HOURS PER WEEK</span>
                <span className="text-emerald-400 font-bold">{profile.time.hoursPerWeek} Hours</span>
              </div>
              <input type="range" min="5" max="60" value={profile.time.hoursPerWeek} onChange={e => setProfile({...profile, time: {...profile.time, hoursPerWeek: parseInt(e.target.value), hoursPerDay: Math.max(1, Math.round(parseInt(e.target.value) / 5))}})} className="w-full accent-emerald-500" />
            </div>
            <div className="p-3 bg-neutral-950/40 border border-white/5 rounded-xl text-xs text-neutral-400">
              System calculates an approximate {profile.time.hoursPerDay} hours per day split over 5 study days.
            </div>
          </Card>
        </div>
      );
      case 8: return (
        <div className="space-y-6 animate-fade-in-up">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Smile className="text-purple-400 w-8 h-8"/> Cognitive Method Preference
            </h2>
            <p className="text-neutral-400 text-sm">Calibrate psychological triggers for custom training modules.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Method Heuristic</span>
              <div className="grid grid-cols-2 gap-4">
                {['Practical (Apply first)', 'Theoretical (Read first)'].map(pref => (
                  <div key={pref} className={cn("p-4 rounded-xl border text-center cursor-pointer text-sm font-semibold", profile.personality.preference === (pref.startsWith('Practical') ? 'Practical' : 'Theoretical') ? "bg-indigo-500/20 border-indigo-500 text-white" : "bg-neutral-900 border-white/5 text-neutral-400")}
                    onClick={() => setProfile({...profile, personality: {...profile.personality, preference: pref.startsWith('Practical') ? 'Practical' : 'Theoretical' as 'Practical' | 'Theoretical'}})}
                  >
                    {pref}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
      case 9: return (
        <div className="space-y-6 animate-fade-in-up">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Flame className="text-orange-500 w-8 h-8"/> Commitment Threshold
            </h2>
            <p className="text-neutral-400 text-sm">Select career urgency milestones.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
             {['3 Months', '6 Months', '12 Months'].map(time => (
               <div key={time} className={cn("p-3 sm:p-4 rounded-xl border text-center cursor-pointer transition-all min-w-0", profile.commitment.timeline === time ? "bg-indigo-500/20 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.2)]" : "bg-neutral-900 border-white/10 text-neutral-400")}
                 onClick={() => setProfile({...profile, commitment: {...profile.commitment, timeline: time}})}
               >
                 <span className="font-bold text-sm sm:text-lg block break-words">{time}</span>
               </div>
             ))}
          </div>
        </div>
      );
      case 10: return (
        <div className="space-y-6 animate-fade-in-up">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Github className="text-white w-8 h-8"/> Dev Sandbox Sync
            </h2>
            <p className="text-neutral-400 text-sm">Provide repository anchors for portfolio analysis.</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">GitHub Account URL</label>
            <input type="text" placeholder="github.com/your-username" className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white w-full focus:outline-none focus:border-indigo-500" value={profile.experience.github} onChange={e => setProfile({...profile, experience: {...profile.experience, github: e.target.value}})} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1">Projects</label>
              <input type="number" min={0} className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white w-full" value={profile.experience.projects} onChange={e => setProfile({...profile, experience: {...profile.experience, projects: parseInt(e.target.value) || 0}})} />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1">Hackathons</label>
              <input type="number" min={0} className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white w-full" value={profile.experience.hackathons} onChange={e => setProfile({...profile, experience: {...profile.experience, hackathons: parseInt(e.target.value) || 0}})} />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1">Internships</label>
              <input type="text" placeholder="None / Company name" className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white w-full" value={profile.experience.internship} onChange={e => setProfile({...profile, experience: {...profile.experience, internship: e.target.value}})} />
            </div>
          </div>
        </div>
      );
      case 11: return (
        <div className="space-y-6 animate-fade-in-up text-center pt-8">
           <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle className="w-10 h-10 text-emerald-500" />
           </div>
           <h2 className="text-4xl font-bold text-white mb-2">Ecosystem Configured</h2>
           <p className="text-base text-neutral-400 mb-8">Personalized curriculum initialized completely from onboarding data.</p>
           
           <div className="max-w-md mx-auto bg-neutral-900/60 border border-white/10 rounded-2xl p-6 text-left mb-8 space-y-4">
             <div className="flex justify-between items-center border-b border-white/5 pb-3">
               <span className="text-sm font-semibold text-neutral-400">Target Role</span>
               <Badge color="indigo">{profile.goals.career}</Badge>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm font-semibold text-neutral-400">Timeline Limit</span>
               <span className="text-sm text-white font-bold">{profile.commitment.timeline}</span>
             </div>
           </div>

           <Button size="xl" onClick={handleFinish} disabled={isAnalyzing} className="w-full max-w-md shadow-[0_0_40px_rgba(79,70,229,0.4)]" icon={<Sparkles className="w-6 h-6"/>}>
             {isAnalyzing ? "Building Matrix..." : "Deploy My Career Path"}
           </Button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col overflow-hidden">
      <div className="h-1.5 w-full bg-neutral-900 shrink-0">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out" style={{ width: `${(step / totalSteps) * 100}%` }} />
      </div>
      
      <header className="px-6 h-16 flex justify-between items-center border-b border-white/5 bg-neutral-950 shrink-0">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-indigo-400" />
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm">Step {step} of {totalSteps}</span>
            <span className="text-xs text-indigo-400 font-semibold">{ONBOARDING_STEP_TITLES[step]}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleSkip}>Skip Wizard</Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
        <div className="w-full max-w-2xl py-10">
          {renderStepContent()}
        </div>
      </div>

      <footer className="px-6 py-4 border-t border-white/5 bg-neutral-950/80 backdrop-blur flex flex-col sm:flex-row justify-between gap-3 shrink-0">
        <Button variant="secondary" onClick={prevStep} disabled={step === 1} className="w-full sm:w-auto min-w-0">Back</Button>
        {step < totalSteps && (
          <Button onClick={nextStep} icon={<ArrowRight className="w-4 h-4 shrink-0"/>} className="w-full sm:w-auto min-w-0">Continue</Button>
        )}
      </footer>
    </div>
  );
}
