import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { useActivityTracking } from "@/hooks/use-activity-tracking";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminEmailCampaigns from "@/pages/admin-email-campaigns";
import AdminEmailAnalytics from "@/pages/admin-email-analytics";
import AdminAutomationSettings from "@/pages/admin-automation-settings";
import AdminCourses from "@/pages/admin-courses";
import AdminModuleEditor from "@/pages/admin-module-editor";
import AdminCourseEditor from "@/pages/admin-course-editor";
import AdminCoursePreview from "@/pages/admin-course-preview";
import AdminExercises from "@/pages/admin-exercises";
import AdminWorkouts from "@/pages/admin-workouts";
import AdminWorkoutVideos from "@/pages/admin-workout-videos";
import AdminPreview from "@/pages/admin-preview";
import AdminExpired from "@/pages/admin-expired";
import AdminExpiring from "@/pages/admin-expiring";
import AdminExtensions from "@/pages/admin-extensions";
import AdminArchived from "@/pages/admin-archived";
import AdminMembers from "@/pages/admin-members";
import AdminActive from "@/pages/admin-active";
import AdminWhatsApp from "@/pages/admin-whatsapp";
import MyLibrary from "@/pages/my-library";
import MyCourses from "@/pages/my-courses";
import CourseViewer from "@/pages/course-viewer";
import PrenatalStrength from "@/pages/prenatal-strength";
import Community from "@/pages/community";
import NotFound from "@/pages/not-found";

// Lazy load heavy pages to improve initial load time
const HealYourCorePage = lazy(() => import("@/pages/heal-your-core"));
const Progress = lazy(() => import("@/pages/progress"));

// Loading component for lazy-loaded pages
function PageLoader({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
}

function ActivityTracker() {
  useActivityTracking();
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin-email-campaigns" component={AdminEmailCampaigns} />
      <Route path="/admin-email-analytics" component={AdminEmailAnalytics} />
      <Route path="/admin-automation-settings" component={AdminAutomationSettings} />
      <Route path="/admin/courses" component={AdminCourses} />
      <Route path="/admin/modules" component={AdminCourses} />
      <Route path="/admin/modules/:moduleId" component={AdminModuleEditor} />
      <Route path="/admin/courses/:courseId" component={AdminCourseEditor} />
      <Route path="/admin/courses/:courseId/preview" component={AdminCoursePreview} />
      <Route path="/admin/exercises" component={AdminExercises} />
      <Route path="/admin/workouts" component={AdminWorkouts} />
      <Route path="/admin/workout-videos" component={AdminWorkoutVideos} />
      <Route path="/admin/preview" component={AdminPreview} />
      <Route path="/admin/expired" component={AdminExpired} />
      <Route path="/admin/expiring" component={AdminExpiring} />
      <Route path="/admin/extensions" component={AdminExtensions} />
      <Route path="/admin/archived" component={AdminArchived} />
      <Route path="/admin/members" component={AdminMembers} />
      <Route path="/admin/active" component={AdminActive} />
      <Route path="/admin/whatsapp" component={AdminWhatsApp} />
      <Route path="/heal-your-core" component={() => (
        <Suspense fallback={<PageLoader message="Loading your program..." />}>
          <HealYourCorePage />
        </Suspense>
      )} />
      <Route path="/progress" component={() => (
        <Suspense fallback={<PageLoader message="Loading progress tracker..." />}>
          <Progress />
        </Suspense>
      )} />
      <Route path="/my-library" component={MyLibrary} />
      <Route path="/my-courses" component={MyCourses} />
      <Route path="/prenatal-strength" component={PrenatalStrength} />
      <Route path="/courses/:courseId" component={CourseViewer} />
      <Route path="/community" component={Community} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ActivityTracker />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
