import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Clock, 
  Calendar,
  Play,
  Sparkles,
  GraduationCap,
  Menu,
  Heart
} from "lucide-react";
import ProfileSettings from "@/components/profile-settings";
import BottomNav from "@/components/bottom-nav";
import zoeImagePath from "@assets/zoe_1_1764958643553.png";
import type { User } from "@shared/schema";

interface Course {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  level: string;
  duration_weeks: number;
  image_url: string | null;
  thumbnail_url: string | null;
  status: string;
  is_enrolled?: boolean;
  enrolled_at?: string;
  enrollment_status?: string;
  progress_percentage?: number;
  completed_at?: string | null;
}

export default function MyCourses() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"enrolled" | "browse">("enrolled");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const { data: enrolledCourses = [], isLoading: loadingEnrolled } = useQuery<Course[]>({
    queryKey: ["/api/courses/enrolled"],
  });

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const CourseCard = ({ course }: { course: Course }) => {
    const getCourseLink = () => {
      if (course.id === 'heal-your-core-course') {
        return '/heal-your-core';
      }
      return `/courses/${course.id}`;
    };

    return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 border-pink-100 group cursor-pointer"
      onClick={() => navigate(getCourseLink())}
      data-testid={`card-course-${course.id}`}
    >
      <div className="relative">
        {course.thumbnail_url || course.image_url ? (
          <img 
            src={course.thumbnail_url || course.image_url || ""} 
            alt={course.name}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
            <GraduationCap className="w-16 h-16 text-white/80" />
          </div>
        )}
        {course.progress_percentage !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-2">
            <div className="flex items-center justify-between text-white text-sm mb-1">
              <span>Progress</span>
              <span>{Math.round(course.progress_percentage)}%</span>
            </div>
            <Progress value={course.progress_percentage} className="h-1.5" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg group-hover:text-pink-600 transition-colors line-clamp-2">
            {course.name}
          </h3>
          <Badge className={getLevelColor(course.level)}>
            {course.level}
          </Badge>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {course.short_description || course.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration_weeks} weeks</span>
          </div>
          {course.enrolled_at && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Started {new Date(course.enrolled_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <Button 
          className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
          data-testid={`button-continue-${course.id}`}
        >
          <Play className="w-4 h-4 mr-2" />
          Continue Learning
        </Button>
      </CardContent>
    </Card>
  );
  };

  const LoadingSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="w-full h-40" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-full mt-4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <header className="bg-white border-b border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                className="p-3 relative transition-all duration-300 hover:scale-110 active:scale-95 group touch-manipulation"
                data-testid="button-hamburger-menu"
                onClick={() => setShowProfileSettings(!showProfileSettings)}
              >
                <Menu className="w-6 h-6 text-pink-500" />
              </button>
            </div>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link href="/dashboard">
                <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent cursor-pointer">
                  Zoe's Courses
                </span>
              </Link>
            </div>

            <div className="w-12"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Hey {user?.firstName || "Mama"}! 💕
              </h1>
              <p className="text-pink-100 text-lg">
                Ready to continue your wellness journey? I've curated special courses just for you.
              </p>
            </div>
            <div className="hidden md:block">
              <img 
                src={zoeImagePath} 
                alt="Zoe" 
                className="w-24 h-24 rounded-full border-4 border-white/30 object-cover"
              />
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <Heart className="w-40 h-40" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "enrolled" | "browse")} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-pink-50">
            <TabsTrigger 
              value="enrolled" 
              className="data-[state=active]:bg-white data-[state=active]:text-pink-600"
              data-testid="tab-enrolled"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              My Courses ({enrolledCourses.length})
            </TabsTrigger>
            <TabsTrigger 
              value="browse" 
              className="data-[state=active]:bg-white data-[state=active]:text-pink-600"
              data-testid="tab-browse"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Coming Soon
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enrolled" className="space-y-6">
            {loadingEnrolled ? (
              <LoadingSkeleton />
            ) : enrolledCourses.length === 0 ? (
              <Card className="border-dashed border-2 border-pink-200">
                <CardContent className="py-12 text-center">
                  <GraduationCap className="w-16 h-16 mx-auto text-pink-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Courses Yet
                  </h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    You haven't started any courses yet. Check back soon for new courses!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse" className="space-y-6">
            <Card className="border-dashed border-2 border-pink-200">
              <CardContent className="py-12 text-center">
                <Sparkles className="w-16 h-16 mx-auto text-pink-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  New Courses Coming Soon!
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  We're working on exciting new courses to help you on your postpartum journey. Stay tuned!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </main>

      {user && (
        <ProfileSettings
          isOpen={showProfileSettings}
          onClose={() => setShowProfileSettings(false)}
          user={user}
          onUserUpdate={(updatedUser) => {
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav />
      
      {/* Spacer for bottom nav */}
      <div className="h-20" />
    </div>
  );
}
