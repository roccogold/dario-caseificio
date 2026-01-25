import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";
import { KeyboardShortcutsProvider } from "@/components/KeyboardShortcuts";
import Index from "./pages/Index";

// Lazy load pages for code splitting
const Calendario = lazy(() => import("./pages/Calendario"));
const Formaggi = lazy(() => import("./pages/Formaggi"));
const Produzioni = lazy(() => import("./pages/Produzioni"));
const Statistiche = lazy(() => import("./pages/Statistiche"));
const LogoPreview = lazy(() => import("./pages/LogoPreview"));
const SubtitlePreview = lazy(() => import("./pages/SubtitlePreview"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component with improved design
const PageSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="p-8 space-y-8">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      {/* Content grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3 rounded-xl border border-border p-6">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="pt-2">
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <KeyboardShortcutsProvider />
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calendario" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageSkeleton />}>
                <Calendario />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/formaggi" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageSkeleton />}>
                <Formaggi />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/produzioni" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageSkeleton />}>
                <Produzioni />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/statistiche" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageSkeleton />}>
                <Statistiche />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/logo-preview" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageSkeleton />}>
                <LogoPreview />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/subtitle-preview" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageSkeleton />}>
                <SubtitlePreview />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route 
            path="*" 
            element={
              <Suspense fallback={<PageSkeleton />}>
                <NotFound />
              </Suspense>
            } 
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
