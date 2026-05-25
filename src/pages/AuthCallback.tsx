import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { getPostAuthPath } from '../utils/authRedirect';

export default function AuthCallback() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    const finalizeSignIn = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error_description') || params.get('error');

        if (errorParam) {
          throw new Error(decodeURIComponent(errorParam));
        }

        const { data: { session } } = await supabase.auth.getSession();
        const code = params.get('code');

        if (!session && code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (exchangeError) {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (!retrySession) throw exchangeError;
          }
        }

        const { data: { session: finalSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const user = finalSession?.user;
        const path = user ? await getPostAuthPath(user.id) : '/login';

        if (isActive) {
          navigate(path, { replace: true });
        }
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : 'Unable to complete sign-in.');
      }
    };

    finalizeSignIn();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
      <h1 className="text-lg font-semibold text-white">
        {error ? 'Sign-in failed' : 'Finishing sign-in...'}
      </h1>
      <p className="text-sm text-neutral-400 mt-2 max-w-md">
        {error ? error : 'Please wait while we connect your account.'}
      </p>
      {error && (
        <button
          onClick={() => navigate('/login', { replace: true })}
          className="mt-6 text-sm font-semibold text-indigo-400 hover:underline"
        >
          Back to sign in
        </button>
      )}
    </div>
  );
}
