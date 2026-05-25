import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Moon, Sun, Bell, Lock, LogOut, User } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../supabase/client';
import { ProfileService } from '../services/profileService';

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notifications, setNotifications] = useState(true);
  const [password, setPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('cf_theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  const applyTheme = (t: 'dark' | 'light') => {
    setTheme(t);
    localStorage.setItem('cf_theme', t);
    document.documentElement.classList.toggle('light', t === 'light');
  };

  const updatePassword = async () => {
    if (password.length < 6) {
      setPasswordMsg('Password must be at least 6 characters.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    setPasswordMsg(error ? error.message : 'Password updated successfully.');
    if (!error) setPassword('');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-extrabold flex items-center gap-3">
            <SettingsIcon className="w-10 h-10 text-indigo-400" /> Settings
          </h1>
          <p className="text-neutral-400 mt-2">Account, appearance, and preferences.</p>
        </header>

        <Card className="p-6 border-white/5 space-y-4">
          <h2 className="font-bold flex items-center gap-2"><User className="w-5 h-5" /> Account</h2>
          <p className="text-sm text-neutral-400">Signed in as <span className="text-white font-semibold">{email}</span></p>
          <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>Edit full profile</Button>
        </Card>

        <Card className="p-6 border-white/5 space-y-4">
          <h2 className="font-bold flex items-center gap-2"><Lock className="w-5 h-5" /> Password</h2>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
          />
          {passwordMsg && <p className="text-sm text-indigo-300">{passwordMsg}</p>}
          <Button onClick={updatePassword}>Update password</Button>
        </Card>

        <Card className="p-6 border-white/5 space-y-4">
          <h2 className="font-bold flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            Appearance
          </h2>
          <div className="flex gap-3">
            <Button variant={theme === 'dark' ? 'primary' : 'secondary'} onClick={() => applyTheme('dark')}>Dark</Button>
            <Button variant={theme === 'light' ? 'primary' : 'secondary'} onClick={() => applyTheme('light')}>Light</Button>
          </div>
          <p className="text-xs text-neutral-500">CareerForge is optimized for dark mode. Light mode is experimental.</p>
        </Card>

        <Card className="p-6 border-white/5 space-y-4">
          <h2 className="font-bold flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</h2>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-neutral-300">Daily StarM reminders & mission alerts</span>
            <input
              type="checkbox"
              checked={notifications}
              onChange={async (e) => {
                setNotifications(e.target.checked);
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  const p = await ProfileService.getProfile(user.id);
                  if (p) {
                    await ProfileService.saveProfile(user.id, {
                      ...p,
                      // stored via notification_settings in DB when column used
                    });
                  }
                }
                localStorage.setItem('cf_notifications', String(e.target.checked));
              }}
              className="accent-indigo-500 w-5 h-5"
            />
          </label>
        </Card>

        <Button variant="ghost" className="text-rose-400 hover:text-rose-300 w-full" icon={<LogOut className="w-4 h-4" />} onClick={signOut}>
          Sign out
        </Button>
      </div>
    </AppShell>
  );
}
