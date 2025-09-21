import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calendar, Target, Dumbbell, Star, Menu, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import programCover from "@assets/program-cover.png";
import ProfileSettings from "@/components/profile-settings";
import type { User, MemberProgram } from "@shared/schema";

export default function MyLibrary() {
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Fetch user's purchased programs
  const { data: memberPrograms = [], isLoading } = useQuery<MemberProgram[]>({
    queryKey: ['/api/member-programs', user?.id],
    enabled: !!user?.id,
  });

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
              <Link to="/dashboard">
                <img 
                  src="/assets/logo.png" 
                  alt="Studio Bloom" 
                  className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
                />
              </Link>
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
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your programs...</p>
          </div>
        )}

        {/* Programs Grid */}
        {!isLoading && (
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            {memberPrograms.map((memberProgram) => {
              const program = (memberProgram as any).program;
              if (!program) return null;
              return (
                <Link key={program.id} to={program.name.includes("Postpartum") ? "/heal-your-core" : "/dashboard"}>
                  <div 
                    className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-pink-100"
                    data-testid={`program-card-${program.id}`}
                  >
                    {/* Header Section */}
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
                        Your Programs
                      </h2>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Discover personalized fitness programs designed to help you achieve your health and wellness goals
                      </p>
                    </div>

                    {/* Program Image */}
                    <div className="relative mb-6 rounded-2xl overflow-hidden">
                      <img 
                        src={program.imageUrl || programCover}
                        alt={program.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Program Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {program.name}
                    </h3>
                    
                    {/* Program Description */}
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {program.description}
                    </p>
                    
                    {/* Program Features */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-800 font-medium">{program.duration}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-800 font-medium">{program.level}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                          <Dumbbell className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-800 font-medium">{program.equipment}</span>
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex gap-3 mb-4">
                      <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Premium Access
                      </div>
                      <div className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                        {program.level}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-900 rounded-full">
                      <div className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full" style={{width: `${((memberProgram.progress || 0) / (program.workoutCount || 1)) * 100}%`}}></div>
                    </div>
                  </div>
                </Link>
              );
            })}
            
            {/* Program 2 - Static Card */}
            <Link to="/heal-your-core">
              <div 
                className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-blue-100"
                data-testid="program-card-program-2"
              >
                {/* Header Section */}
                <div className="text-center mb-6">
                  <div className="inline-block bg-gradient-to-r from-blue-400 to-cyan-400 text-white px-4 py-2 rounded-full text-sm font-bold mb-3">
                    PROGRAM 2
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                    Stability & Breathwork Program
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    ✨ Week 2 comprehensive movement and breathing focus
                  </p>
                </div>

                {/* Program Image */}
                <div className="relative mb-6 rounded-2xl overflow-hidden">
                  <img 
                    src={programCover}
                    alt="Stability & Breathwork Program"
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20"></div>
                </div>
                
                {/* Program Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Week 2: Stability & Breathwork
                </h3>
                
                {/* Program Description */}
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Build upon your foundation with controlled movements and enhanced breathwork. Focus on stability, control, and mind-body connection.
                </p>
                
                {/* Program Features */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-800 font-medium">1 Week Program</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-800 font-medium">Intermediate</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-800 font-medium">Mat, Breath, Patience</span>
                  </div>
                </div>
                
                {/* Badges */}
                <div className="flex gap-3 mb-4">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Premium Access
                  </div>
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Week 2
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-900 rounded-full">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full" style={{width: '0%'}}></div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Empty state if no programs - but we now have static Program 2, so this won't show */}
        {!isLoading && memberPrograms.length === 0 && false && (
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