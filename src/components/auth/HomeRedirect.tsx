import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import Landing from '../../pages/Landing';

export default function HomeRedirect() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (session) {
          setAuthenticated(true);
          setLoading(false);
          return;
        }

        const { data: refresh } = await supabase.auth.refreshSession();
        if (!isMounted) return;
        setAuthenticated(!!refresh.session);
      } catch {
        if (!isMounted) return;
        setAuthenticated(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      setAuthenticated(!!session);
      if (event === 'INITIAL_SESSION') {
        setLoading(false);
      }
    });

    restoreSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Landing />;
}