import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, PlayCircle, BookOpen, CheckCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import programCover from "@assets/program-cover.png";
import ProfileSettings from "@/components/profile-settings";

interface Program {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  totalVideos: number;
  totalDuration: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function MyLibrary() {
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [boughtPrograms] = useState<Program[]>([
    {
      id: "1",
      title: "Your Postpartum Strength Recovery Program",
      description: "A comprehensive 6-week postnatal fitness program for mothers 6 weeks to 6 years postpartum",
      thumbnail: programCover,
      totalVideos: 24,
      totalDuration: "4h 30m"
    },
    {
      id: "2",
      title: "The Mama Summit",
      description: "Expert talks and guidance for new mothers covering relationships, birth, sleep, and more",
      thumbnail: "",
      totalVideos: 15,
      totalDuration: "8h 15m"
    }
  ]);

  // Get user from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side navigation */}
            <div className="flex items-center">
              {/* Hamburger Menu Button */}
              <button 
                className="p-3 relative transition-all duration-300 md:hover:scale-110 md:hover:rotate-12 active:scale-95 group touch-manipulation"
                data-testid="button-hamburger-menu"
                aria-label={showProfileSettings ? "Close menu" : "Open menu"}
                onClick={() => setShowProfileSettings(!showProfileSettings)}
              >
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <div className={`absolute transition-all duration-300 transform md:group-hover:scale-110 ${
                    showProfileSettings ? 'rotate-45 translate-y-0' : 'rotate-0 -translate-y-2'
                  }`}>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-rose-400 via-pink-500 to-pink-600 rounded shadow-sm md:group-hover:shadow-md md:group-hover:shadow-pink-200"></div>
                  </div>
                  <div className={`absolute transition-all duration-300 md:group-hover:scale-110 ${
                    showProfileSettings ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
                  }`}>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-rose-400 via-pink-500 to-pink-600 rounded shadow-sm md:group-hover:shadow-md md:group-hover:shadow-pink-200"></div>
                  </div>
                  <div className={`absolute transition-all duration-300 transform md:group-hover:scale-110 ${
                    showProfileSettings ? '-rotate-45 translate-y-0' : 'rotate-0 translate-y-2'
                  }`}>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-rose-400 via-pink-500 to-pink-600 rounded shadow-sm md:group-hover:shadow-md md:group-hover:shadow-pink-200"></div>
                  </div>
                </div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-rose-400/20 via-pink-500/20 to-pink-600/20 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
              </button>
            </div>
            
            {/* Centered Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img 
                src="/assets/logo.png" 
                alt="Studio Bloom" 
                className="h-12 w-auto"
              />
            </div>
            
            {/* Right side spacer to maintain balance */}
            <div className="flex items-center opacity-0 pointer-events-none">
              <button className="p-3 rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Settings Overlay */}
      {showProfileSettings && user && (
        <ProfileSettings 
          isOpen={showProfileSettings} 
          onClose={() => setShowProfileSettings(false)}
          user={user}
          onUserUpdate={handleUserUpdate}
        />
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/dashboard">
            <button 
              className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-pink-600 transition-all duration-300 transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700 transition-colors duration-300">
                Back
              </span>
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/0 to-pink-600/0 group-hover:from-pink-400/10 group-hover:to-pink-600/10 transition-all duration-300 pointer-events-none"></div>
            </button>
          </Link>
        </div>

        {/* My Library Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
          <p className="text-gray-600 mt-2">Your purchased programs and content</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {boughtPrograms.map((program) => (
            <Link key={program.id} to={program.id === "1" ? "/heal-your-core" : "/dashboard"}>
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                data-testid={`program-card-${program.id}`}
              >
                <div className="relative">
                  {program.thumbnail ? (
                    <img 
                      src={program.thumbnail}
                      alt={program.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-pink-200 rounded-t-lg flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-pink-400" />
                    </div>
                  )}
                  
                  {/* Purchased Badge */}
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                    <CheckCircle className="w-3 h-3" />
                    Purchased
                  </div>
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-t-lg flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle 
                    className="text-lg text-gray-900 group-hover:text-pink-600 transition-colors"
                    data-testid={`text-program-title-${program.id}`}
                  >
                    {program.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {program.description}
                  </p>
                  
                  <div 
                    className="flex items-center justify-between text-sm text-gray-500"
                    data-testid={`text-program-stats-${program.id}`}
                  >
                    <span className="flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" />
                      {program.totalVideos} videos
                    </span>
                    <span>{program.totalDuration}</span>
                  </div>
                  
                  <Button 
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                    data-testid={`button-access-program-${program.id}`}
                    asChild
                  >
                    <span>Access Program</span>
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty state if no programs */}
        {boughtPrograms.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No programs yet</h3>
            <p className="text-gray-500">Your purchased programs will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}