import { useEffect, useState } from "react";
import { isAuthenticated, onAuthStateChange } from "@/utils/supabaseAuth";
import Login from "@/components/Login";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In sviluppo, verifica anche l'autenticazione locale
        const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
        if (isDevelopment) {
          // Import dinamico per evitare problemi di circolarità
          const { isAuthenticated: isLocalAuthenticated } = await import('@/utils/auth');
          const localAuth = isLocalAuthenticated();
          if (localAuth) {
            setAuthenticated(true);
            setLoading(false);
            return;
          }
        }
        
        const authStatus = await isAuthenticated();
        setAuthenticated(authStatus);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setAuthenticated(false);
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
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Login />;
  }

  return <>{children}</>;
}
