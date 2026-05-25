import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import Landing from '../../pages/Landing';

export default function HomeRedirect() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(!!data.session);
      setLoading(false);
    });
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