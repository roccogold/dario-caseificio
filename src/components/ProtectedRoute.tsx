import { useEffect, useState } from "react";
import { isAuthenticated, onAuthStateChange } from "@/utils/supabaseAuth";
import Login from "@/components/Login";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if Supabase is configured
        const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
        const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
        
        // In sviluppo o se Supabase non è configurato, usa autenticazione locale
        if (isDevelopment || !hasSupabase) {
          // Import dinamico per evitare problemi di circolarità
          const { isAuthenticated: isLocalAuthenticated } = await import('@/utils/auth');
          const localAuth = isLocalAuthenticated();
          if (localAuth) {
            setAuthenticated(true);
            setLoading(false);
            return;
          }
        }
        
        // In produzione con Supabase configurato, usa Supabase Auth
        if (hasSupabase) {
          const authStatus = await isAuthenticated();
          setAuthenticated(authStatus);
        } else {
          // Fallback: se Supabase non è configurato in produzione, usa localStorage
          const { isAuthenticated: isLocalAuthenticated } = await import('@/utils/auth');
          const localAuth = isLocalAuthenticated();
          setAuthenticated(localAuth);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        // Fallback to local auth on error
        try {
          const { isAuthenticated: isLocalAuthenticated } = await import('@/utils/auth');
          const localAuth = isLocalAuthenticated();
          setAuthenticated(localAuth);
        } catch (fallbackError) {
          console.error("Fallback auth error:", fallbackError);
          setAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Ascolta i cambiamenti di autenticazione
    const authListener = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setAuthenticated(true);
        setLoading(false);
      } else if (event === 'SIGNED_OUT' || !session) {
        setAuthenticated(false);
        setLoading(false);
      }
    });

    return () => {
      // Handle both return types from onAuthStateChange
      if ('unsubscribe' in authListener && typeof authListener.unsubscribe === 'function') {
        authListener.unsubscribe();
      } else if (authListener?.data?.subscription?.unsubscribe) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Login />;
  }

  return <>{children}</>;
}
