import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CircleDot,
  BarChart3,
  ClipboardList,
  Menu,
  X,
  Milk,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/utils/supabaseAuth";
import { clearSession } from "@/utils/auth";

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Calendario", href: "/calendario", icon: Calendar },
  { name: "Produzioni", href: "/produzioni", icon: ClipboardList },
  { name: "Formaggi", href: "/formaggi", icon: Milk },
  { name: "Statistiche", href: "/statistiche", icon: BarChart3 },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Determina se usare autenticazione locale o Supabase
      const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
      
      if (isDevelopment) {
        // Logout locale
        clearSession();
      } else {
        // Logout Supabase
        await signOut();
      }
      
      // Reindirizza al login e ricarica la pagina
      navigate('/', { replace: true });
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: pulisci la sessione locale e ricarica
      clearSession();
      navigate('/', { replace: true });
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-sidebar md:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-32 items-start border-b border-sidebar-border px-6 pt-8">
            <Link to="/calendario" className="flex items-center gap-4 w-full">
              <img 
                src="/frog-logo.svg" 
                alt="Dario Frog" 
                className="h-16 w-16 flex-shrink-0"
              />
              <div className="flex flex-col">
                <span 
                  className="text-2xl tracking-widest uppercase"
                  style={{ 
                    color: '#8B7355',
                    fontFamily: "'Playfair Display', 'EB Garamond', Georgia, serif",
                    fontWeight: 700,
                    letterSpacing: '0.1em'
                  }}
                >
                  DARIO
                </span>
                <span 
                  className="text-xs tracking-wide font-serif"
                  style={{ color: '#A68B6F' }}
                >
                  Corzano e Paterno
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="border-t border-sidebar-border p-4">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-destructive"
            >
              <LogOut className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-destructive" />
              Esci
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link to="/calendario" className="flex items-center gap-2">
            <img 
              src="/frog-logo.svg" 
              alt="Dario Frog" 
              className="h-8 w-8"
            />
            <span 
              className="text-lg tracking-widest uppercase"
              style={{ 
                color: '#8B7355',
                fontFamily: "'TC Galliard Bold', 'Garamond Premier Semibold Caption', 'Garamond Premier Semibold', 'Laurentian Semi Bold', 'EB Garamond', Georgia, serif",
                fontWeight: 700,
                letterSpacing: '0.1em'
              }}
            >
              DARIO
            </span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-muted touch-manipulation"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-l border-border bg-background p-4 md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                          isActive
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
                
                {/* Logout Button */}
                <div className="border-t border-border pt-4 mt-auto">
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-destructive"
                  >
                    <LogOut className="h-5 w-5" />
                    Esci
                  </button>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="min-h-screen pt-16 md:ml-64 md:pt-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
