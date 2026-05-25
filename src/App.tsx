import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthCallback from './pages/AuthCallback';
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import LearnFocus from './pages/Learn';
import Arena from './pages/Arena';
import RoadmapPage from './pages/Roadmap';
import ChallengesPage from './pages/Challenges';
import AnalyticsPage from './pages/Analytics';
import StarMPage from './pages/StarM';
import ProfilePage from './pages/Profile';
import SettingsPage from './pages/Settings';
import HackathonPage from './pages/Hackathon';
import { AuthGuard } from './components/auth/AuthGuard';
import { useEffect, useState } from 'react';
import { supabase } from './supabase/client';
import HomeRedirect from './components/auth/HomeRedirect';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected Routes */}
        <Route path="/welcome" element={
          <AuthGuard>
            <Welcome />
          </AuthGuard>
        } />
        
        <Route path="/onboarding" element={
          <AuthGuard>
            <Onboarding />
          </AuthGuard>
        } />
        
        <Route path="/dashboard" element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        } />
        
        <Route path="/learn/:skillId" element={
          <AuthGuard>
            <LearnFocus />
          </AuthGuard>
        } />
        
        <Route path="/roadmap" element={
          <AuthGuard>
            <RoadmapPage />
          </AuthGuard>
        } />

        <Route path="/challenges" element={
          <AuthGuard>
            <ChallengesPage />
          </AuthGuard>
        } />

        <Route path="/analytics" element={
          <AuthGuard>
            <AnalyticsPage />
          </AuthGuard>
        } />

        <Route path="/starm" element={
          <AuthGuard>
            <StarMPage />
          </AuthGuard>
        } />

        <Route path="/profile" element={
          <AuthGuard>
            <ProfilePage />
          </AuthGuard>
        } />

        <Route path="/settings" element={
          <AuthGuard>
            <SettingsPage />
          </AuthGuard>
        } />

        <Route path="/hackathon" element={
          <AuthGuard>
            <HackathonPage />
          </AuthGuard>
        } />

        <Route path="/arena/:challengeId" element={
          <AuthGuard>
            <Arena />
          </AuthGuard>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}