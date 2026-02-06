import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { useActivityTracking } from "@/hooks/use-activity-tracking";
import UpdatePrompt from "@/components/update-prompt";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

// Lazy load all heavy pages to improve initial load time
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Community = lazy(() => import("@/pages/community"));
const MyCourses = lazy(() => import("@/pages/my-courses"));
const MyLibrary = lazy(() => import("@/pages/my-library"));
const Profile = lazy(() => import("@/pages/profile"));
const ProgressPhotos = lazy(() => import("@/pages/progress-photos"));
const CourseViewer = lazy(() => import("@/pages/course-viewer"));
const PrenatalStrength = lazy(() => import("@/pages/prenatal-strength"));
const HealYourCorePage = lazy(() => import("@/pages/heal-your-core"));
const Progress = lazy(() => import("@/pages/progress"));

// Lazy load admin pages (rarely accessed by regular users)
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const Admin = lazy(() => import("@/pages/admin"));
const AdminAnalytics = lazy(() => import("@/pages/admin-analytics"));
const AdminEmailCampaigns = lazy(() => import("@/pages/admin-email-campaigns"));
const AdminEmailAnalytics = lazy(() => import("@/pages/admin-email-analytics"));
const AdminAutomationSettings = lazy(() => import("@/pages/admin-automation-settings"));
const AdminCourses = lazy(() => import("@/pages/admin-courses"));
const AdminModuleEditor = lazy(() => import("@/pages/admin-module-editor"));
const AdminCourseEditor = lazy(() => import("@/pages/admin-course-editor"));
const AdminCoursePreview = lazy(() => import("@/pages/admin-course-preview"));
const AdminExercises = lazy(() => import("@/pages/admin-exercises"));
const AdminWorkouts = lazy(() => import("@/pages/admin-workouts"));
const AdminWorkoutVideos = lazy(() => import("@/pages/admin-workout-videos"));
const AdminPreview = lazy(() => import("@/pages/admin-preview"));
const AdminExpired = lazy(() => import("@/pages/admin-expired"));
const AdminExpiring = lazy(() => import("@/pages/admin-expiring"));
const AdminExtensions = lazy(() => import("@/pages/admin-extensions"));
const AdminArchived = lazy(() => import("@/pages/admin-archived"));
const AdminMembers = lazy(() => import("@/pages/admin-members"));
const AdminActive = lazy(() => import("@/pages/admin-active"));
const AdminWhatsApp = lazy(() => import("@/pages/admin-whatsapp"));
const AdminReports = lazy(() => import("@/pages/admin-reports"));

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

function LazyRoute({ component: Component, message }: { component: React.LazyExoticComponent<React.ComponentType<any>>; message: string }) {
  return (
    <Suspense fallback={<PageLoader message={message} />}>
      <Component />
    </Suspense>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={() => <LazyRoute component={Dashboard} message="Loading dashboard..." />} />
      <Route path="/admin/login" component={() => <LazyRoute component={AdminLogin} message="Loading admin login..." />} />
      <Route path="/admin" component={() => <LazyRoute component={Admin} message="Loading admin..." />} />
      <Route path="/admin/analytics" component={() => <LazyRoute component={AdminAnalytics} message="Loading analytics..." />} />
      <Route path="/admin-email-campaigns" component={() => <LazyRoute component={AdminEmailCampaigns} message="Loading..." />} />
      <Route path="/admin-email-analytics" component={() => <LazyRoute component={AdminEmailAnalytics} message="Loading..." />} />
      <Route path="/admin-automation-settings" component={() => <LazyRoute component={AdminAutomationSettings} message="Loading..." />} />
      <Route path="/admin/courses" component={() => <LazyRoute component={AdminCourses} message="Loading courses..." />} />
      <Route path="/admin/modules" component={() => <LazyRoute component={AdminCourses} message="Loading modules..." />} />
      <Route path="/admin/modules/:moduleId" component={() => <LazyRoute component={AdminModuleEditor} message="Loading..." />} />
      <Route path="/admin/courses/:courseId" component={() => <LazyRoute component={AdminCourseEditor} message="Loading..." />} />
      <Route path="/admin/courses/:courseId/preview" component={() => <LazyRoute component={AdminCoursePreview} message="Loading..." />} />
      <Route path="/admin/exercises" component={() => <LazyRoute component={AdminExercises} message="Loading..." />} />
      <Route path="/admin/workouts" component={() => <LazyRoute component={AdminWorkouts} message="Loading..." />} />
      <Route path="/admin/workout-videos" component={() => <LazyRoute component={AdminWorkoutVideos} message="Loading..." />} />
      <Route path="/admin/preview" component={() => <LazyRoute component={AdminPreview} message="Loading..." />} />
      <Route path="/admin/expired" component={() => <LazyRoute component={AdminExpired} message="Loading..." />} />
      <Route path="/admin/expiring" component={() => <LazyRoute component={AdminExpiring} message="Loading..." />} />
      <Route path="/admin/extensions" component={() => <LazyRoute component={AdminExtensions} message="Loading..." />} />
      <Route path="/admin/archived" component={() => <LazyRoute component={AdminArchived} message="Loading..." />} />
      <Route path="/admin/members" component={() => <LazyRoute component={AdminMembers} message="Loading..." />} />
      <Route path="/admin/active" component={() => <LazyRoute component={AdminActive} message="Loading..." />} />
      <Route path="/admin/whatsapp" component={() => <LazyRoute component={AdminWhatsApp} message="Loading..." />} />
      <Route path="/admin/reports" component={() => <LazyRoute component={AdminReports} message="Loading reports..." />} />
      <Route path="/heal-your-core" component={() => <LazyRoute component={HealYourCorePage} message="Loading your program..." />} />
      <Route path="/progress" component={() => <LazyRoute component={Progress} message="Loading progress tracker..." />} />
      <Route path="/my-library" component={() => <LazyRoute component={MyLibrary} message="Loading library..." />} />
      <Route path="/my-courses" component={() => <LazyRoute component={MyCourses} message="Loading courses..." />} />
      <Route path="/my-progress-photos" component={() => <LazyRoute component={ProgressPhotos} message="Loading photos..." />} />
      <Route path="/prenatal-strength" component={() => <LazyRoute component={PrenatalStrength} message="Loading..." />} />
      <Route path="/courses/:courseId" component={() => <LazyRoute component={CourseViewer} message="Loading course..." />} />
      <Route path="/community" component={() => <LazyRoute component={Community} message="Loading community..." />} />
      <Route path="/profile" component={() => <LazyRoute component={Profile} message="Loading profile..." />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UpdatePrompt />
        <ActivityTracker />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
