import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import MyLibrary from "@/pages/my-library";
import NotFound from "@/pages/not-found";

// Lazy load heavy pages to improve initial load time
const HealYourCorePage = lazy(() => import("@/pages/heal-your-core"));
const Progress = lazy(() => import("@/pages/progress"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/heal-your-core" component={() => (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>}>
          <HealYourCorePage />
        </Suspense>
      )} />
      <Route path="/progress" component={() => (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>}>
          <Progress />
        </Suspense>
      )} />
      <Route path="/my-library" component={MyLibrary} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
