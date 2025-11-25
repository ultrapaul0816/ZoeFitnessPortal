import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ChevronLeft, Play, Loader2 } from "lucide-react";
import { ProgramData } from "@/data/workoutPrograms";
import { useWorkoutContent } from "@/hooks/useWorkoutContent";

interface NavigationProps {
  programId: string;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  navigateToNextTab: () => void;
  navigateToPreviousTab: () => void;
  getNavigationText: (direction: 'prev' | 'next') => string;
}

function StaticProgramCard({ program, isExpanded, onToggle }: { program: ProgramData; isExpanded: boolean; onToggle: () => void }) {
  const { colorScheme } = program;
  
  return (
    <Card className={`overflow-hidden border-l-4 ${colorScheme.borderColor}`}>
      <CardHeader className={`${colorScheme.bgColor} cursor-pointer`} onClick={onToggle}>
        <div className="block lg:hidden">
          <div className="mb-4">
            <div className={`${colorScheme.sectionClass} text-white px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap inline-block shadow-lg`}>
              WEEK {program.week}
            </div>
          </div>
          <div className="mb-3">
            <CardTitle className="text-base text-gray-900 font-bold mb-2">{program.title}</CardTitle>
            <CardDescription className={`${colorScheme.accentColor} font-semibold text-sm`}>Workout Schedule: {program.schedule}</CardDescription>
            <p className="text-xs text-gray-600 mt-1">{program.scheduleDetail}</p>
          </div>
          <div>
            <div className="text-xs text-gray-700 font-bold uppercase tracking-wide mb-2">Equipment Needed</div>
            <div className="flex flex-wrap gap-2">
              {program.equipment.map((eq, idx) => (
                <span key={idx} className={`${eq.colorClass} px-3 py-1.5 rounded-full text-xs font-medium shadow-sm`}>{eq.name}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="hidden lg:flex lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`${colorScheme.sectionClass} text-white px-3 py-1 rounded font-semibold text-sm whitespace-nowrap`}>
              WEEK {program.week}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg text-gray-900">{program.title}</CardTitle>
              <CardDescription className={`${colorScheme.accentColor} font-semibold text-sm`}>Workout Schedule: {program.schedule}</CardDescription>
              <p className="text-xs text-gray-600 mt-1">{program.scheduleDetail}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-3">
              <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Equipment Needed</div>
              <div className="flex flex-wrap gap-2 justify-end">
                {program.equipment.map((eq, idx) => (
                  <span key={idx} className={`${eq.colorClass} px-3 py-1.5 rounded-full text-xs font-medium shadow-sm`}>{eq.name}</span>
                ))}
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 ${colorScheme.textColor} transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-4">
          <div className={`mb-4 ${colorScheme.bgColor} p-4 rounded-xl border-l-4 ${colorScheme.borderColor} shadow-sm`}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full`} style={{backgroundColor: colorScheme.borderColor.replace('border-', '')}}></div>
                <span className={`${colorScheme.textColor} font-bold text-sm uppercase tracking-wide`}>Coach's Note</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed pl-4">{program.coachNote}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className={`${colorScheme.sectionClass} p-3 rounded-t-lg`}>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm uppercase tracking-wide">{program.part1.title}</h4>
              </div>
            </div>
            <div className={`${colorScheme.bgColor} p-4 rounded-b-lg border ${colorScheme.borderColor} space-y-3`}>
              {program.part1.exercises.map((ex, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  {ex.url ? (
                    <a href={ex.url} target="_blank" rel="noopener noreferrer" className={`${colorScheme.textColor} font-semibold underline cursor-pointer text-sm`}>
                      {ex.name}
                    </a>
                  ) : (
                    <span className={`${colorScheme.textColor} font-semibold text-sm`}>{ex.name}</span>
                  )}
                  <span className={`${colorScheme.textColor} font-bold text-sm ${colorScheme.bgColor} px-3 py-1 rounded-full`}>{ex.reps}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className={`${colorScheme.sectionClass} p-3 rounded-t-lg`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide">Part 2: Main Workout (3 Rounds)</h4>
                </div>
                <Button className={`${colorScheme.buttonColor} text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg self-start sm:self-center`}>
                  <Play className="w-4 h-4" />
                  <a href={program.part2.playlistUrl} target="_blank" rel="noopener noreferrer">PLAY ALL</a>
                </Button>
              </div>
            </div>
            <div className="bg-white rounded-b-lg border border-gray-200 p-4">
              <div className="space-y-3">
                {program.part2.exercises.map((exercise) => (
                  <div key={exercise.num} className={`bg-gray-50 rounded-lg p-4 border-l-4 ${colorScheme.borderColor} ${colorScheme.hoverBg} transition-colors`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-8 h-8 ${colorScheme.sectionClass} text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                          {exercise.num}
                        </div>
                        <a href={exercise.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline font-semibold leading-tight text-sm">
                          {exercise.name}
                        </a>
                      </div>
                      <div className="text-gray-700 font-bold text-sm bg-white px-3 py-1.5 rounded-full border flex-shrink-0">
                        {exercise.reps} ×3
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${colorScheme.bgColor} p-4 rounded-xl border-l-4 ${colorScheme.borderColor} shadow-sm`}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full`} style={{backgroundColor: colorScheme.borderColor.replace('border-', '')}}></div>
                <h4 className={`font-bold ${colorScheme.textColor} text-sm uppercase tracking-wide`}>How To Use</h4>
              </div>
              <div className="pl-4 space-y-3">
                <p className="text-gray-700 text-sm leading-relaxed">
                  All <span className="text-blue-600 underline font-medium">blue underlined text</span> is clickable and will open a video link. 
                  <span className="font-semibold"> PLAY ALL</span> indicates that the following workout can be played as a single 
                  playlist containing all the exercises to make it easier to flow through. However, please have listened to each exercise instruction beforehand.
                </p>
                <div className={`${colorScheme.bgColor} p-3 rounded-lg border ${colorScheme.borderColor}`}>
                  <p className={`${colorScheme.textColor} text-sm font-medium`}>
                    <span className="font-bold">Rest:</span> Rest a minimum of 30 secs - ONE minute between movements. Rest more if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl border-l-4 border-orange-500 shadow-sm mt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <h4 className="font-bold text-orange-800 text-sm uppercase tracking-wide">Important Safety</h4>
              </div>
              <div className="pl-4 bg-orange-100 p-3 rounded-lg">
                <p className="text-orange-800 text-sm leading-relaxed">
                  <span className="font-semibold">Listen to Your Body:</span> Always pay attention to how you feel and adjust accordingly. | 
                  <span className="font-semibold">Take Options Given:</span> Utilize the modifications provided to suit your comfort level. | 
                  <span className="font-semibold">Reduce Reps/Rounds:</span> Don't hesitate to reduce the number of repetitions or rounds if needed. | 
                  <span className="font-semibold">Adjust Weights:</span> Opt for lighter weights or no weights at all if you feel any discomfort.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function ProgramsSection({ 
  programId,
  canGoNext, 
  canGoPrevious, 
  navigateToNextTab, 
  navigateToPreviousTab,
  getNavigationText 
}: NavigationProps) {
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({});
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({});
  
  const { data: workoutPrograms = [], isLoading } = useWorkoutContent();

  const toggleProgram = (programId: string) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        <span className="ml-2 text-gray-600">Loading workout programs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Programs Section Title */}
      <div className="mb-8 text-left">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
          Programs
        </h2>
        <p className="text-sm font-medium text-gray-600 border-l-4 border-purple-400 pl-4 bg-gradient-to-r from-purple-50 to-transparent py-2">
          Your comprehensive six week postnatal fitness journey programs
        </p>
      </div>

      {/* Cardio Guide Section */}
      <Card className="overflow-hidden border-l-4 border-cyan-400 shadow-xl">
        <CardHeader 
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cursor-pointer transition-all duration-300 relative overflow-hidden"
          onClick={() => toggleProgram('cardio-guide')}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            {/* Mobile Layout */}
            <div className="block lg:hidden">
              {/* Program Badge on top */}
              <div className="mb-3">
                <div className="bg-gradient-to-r from-white to-gray-50 text-cyan-600 px-3 py-2 rounded-xl font-bold text-xs whitespace-nowrap shadow-lg border-2 border-cyan-200 inline-block">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                    CARDIO GUIDE
                  </div>
                </div>
              </div>
              
              {/* Title and Description */}
              <div className="mb-3">
                <div className="text-white font-bold text-sm tracking-tight drop-shadow-md mb-1">
                  Cardio Integration Guide
                </div>
                <div className="text-cyan-100 font-normal text-xs drop-shadow-sm">
                  ❤️ How to safely add cardio to your recovery journey
                </div>
              </div>
              
              {/* Info box and dropdown */}
              <div className="flex items-center justify-between">
                <div className="bg-white bg-opacity-10 px-3 py-2 rounded-lg backdrop-blur-sm flex-1 mr-3">
                  <div className="text-xs text-cyan-100 font-bold uppercase tracking-wide">Optional Add-On</div>
                  <div className="text-xs text-white font-medium">Cardio safety, plans & schedules</div>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-white to-cyan-100 text-cyan-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedPrograms['cardio-guide'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0 pr-2">
                <div className="bg-gradient-to-r from-white to-gray-50 text-cyan-600 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap shadow-lg border-2 border-cyan-200 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                    <span>CARDIO GUIDE</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 py-2">
                  <CardTitle className="text-2xl text-white font-bold tracking-tight drop-shadow-md leading-tight">
                    Cardio Integration Guide
                  </CardTitle>
                  <CardDescription className="text-cyan-100 font-semibold text-base mt-2 drop-shadow-sm leading-tight">
                    ❤️ How to safely add cardio to your recovery journey
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right bg-white bg-opacity-10 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <div className="text-sm text-cyan-100 font-bold uppercase tracking-wide">Optional Add-On</div>
                  <div className="text-sm text-white font-medium">Cardio safety, plans & schedules</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-white to-cyan-100 text-cyan-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedPrograms['cardio-guide'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {expandedPrograms['cardio-guide'] && (
          <CardContent className="p-6 border-t border-cyan-100">
            <div className="space-y-8">
              
              {/* Topic 7: How to Include Cardio – Safely & Strategically */}
              <Card className="overflow-hidden border-l-4 border-l-green-400">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="text-lg text-gray-900">How to Include Cardio – Safely & Strategically</CardTitle>
                  <CardDescription className="text-green-600 font-semibold text-sm">Building cardiovascular fitness during postpartum recovery</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-5">
                    <p className="text-sm">
                      This cardio guide is designed to work for you whether you're 6 weeks postpartum, 6 months in, or 6 years down the line. The truth is—you can rebuild cardiovascular fitness at any time, and doing so can dramatically improve your stamina, mental health, and total-body strength.
                    </p>
                    
                    <p className="text-sm mt-4">
                      If you're just returning to movement after birth (even years later), start with the LISS (Low-Intensity Steady State) options and progress only when you feel core-ready, leak-free, and stable. The weekly suggestions here are optional—but powerful. You can walk, march, spin, or simply move at a pace that feels good.
                    </p>
                    
                    <div className="mt-6">
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 font-bold text-lg">❖</span>
                          <span><strong className="text-green-600">Early Postpartum (6–12 weeks):</strong> Focus on gentle walks, stroller movement, breath-led cardio.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 font-bold text-lg">❖</span>
                          <span><strong className="text-green-600">Mid-Rebuild (3–6 months+):</strong> Progress to brisk walks, inclines, and low-impact rhythm-based cardio.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 font-bold text-lg">❖</span>
                          <span><strong className="text-green-600">Ready for More?</strong> See the "Return to Impact" test later in this guide before trying HIIT or plyometric.</span>
                        </li>
                      </ul>
                    </div>
                    
                    <p className="text-sm mt-6 italic">
                      There's no deadline on feeling fit. Do what feels right for your stage, energy, and healing pace.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Topic 8: Cardio Plan Overview */}
              <Card className="overflow-hidden border-l-4 border-l-blue-400">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="text-lg text-gray-900">Cardio Plan Overview</CardTitle>
                  <CardDescription className="text-blue-600 font-semibold text-sm">The cardio is optional, but oh boy, will it increase your fitness, your results and overall confidence!</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-6">
                    
                    {/* Cardio Types Legend */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                      <div className="bg-green-100 p-3 rounded-lg border-l-4 border-green-400">
                        <h5 className="font-semibold text-green-700 text-sm mb-1">LISS</h5>
                        <p className="text-xs text-green-600">Slow & steady movement (walk, swim, light bike)</p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-lg border-l-4 border-orange-400">
                        <h5 className="font-semibold text-orange-700 text-sm mb-1">MISS</h5>
                        <p className="text-xs text-orange-600">Slightly faster, steady pace (jog, incline walk, elliptical)</p>
                      </div>
                      <div className="bg-red-100 p-3 rounded-lg border-l-4 border-red-400">
                        <h5 className="font-semibold text-red-700 text-sm mb-1">HIIT</h5>
                        <p className="text-xs text-red-600">Short bursts of effort followed by rest (30s work / 90s rest)</p>
                      </div>
                    </div>

                    {/* Week by Week Cardio Plans */}
                    <div className="space-y-4">
                      {/* Week 1 */}
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #f3a8cb 0%, #f2038b 100%)'}}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Week 1</span>
                              <h4 className="font-bold text-lg mt-1">Gentle Foundation</h4>
                            </div>
                            <div className="bg-green-500 px-3 py-1 rounded-full">
                              <span className="text-xs font-bold">LISS</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 text-xs">Intensity</span>
                              <p className="font-semibold">40-50% MHR</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Duration</span>
                              <p className="font-semibold">10-15 mins</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Days</span>
                              <p className="font-semibold">Day 2, 4</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Rest Day</span>
                              <p className="font-semibold">Day 6</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                            <strong>Focus:</strong> Gentle walks, breathing flows, stroller movement. Focus on blood flow, not effort.
                          </p>
                        </div>
                      </div>

                      {/* Week 2 */}
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #b3c0e4 0%, #9aafdc 100%)'}}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Week 2</span>
                              <h4 className="font-bold text-lg mt-1">Building Rhythm</h4>
                            </div>
                            <div className="bg-green-500 px-3 py-1 rounded-full">
                              <span className="text-xs font-bold">LISS</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 text-xs">Intensity</span>
                              <p className="font-semibold">50-60% MHR</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Duration</span>
                              <p className="font-semibold">20 mins</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Days</span>
                              <p className="font-semibold">Day 2, 6</p>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs">Rest Day</span>
                              <p className="font-semibold">Day 4</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                            <strong>Focus:</strong> Consistency over intensity. Light walks with gentle inclines or rhythmic movement.
                          </p>
                        </div>
                      </div>

                      {/* Weeks 3-6 Summary */}
                      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'}}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Weeks 3-6</span>
                              <h4 className="font-bold text-lg mt-1">Progressive Intensity</h4>
                            </div>
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 rounded-full">
                              <span className="text-xs font-bold">MISS + HIIT</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <p className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
                            <strong>Progression:</strong> Weeks 3-4 introduce MISS (25-30 mins). Weeks 5-6 add short HIIT intervals while maintaining steady cardio base. Always listen to your body and adjust as needed.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Important Tips Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-700 mb-3">Important Guidelines</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold">❖</span>
                          <span><strong>MHR Formula:</strong> Max Heart Rate = 220 - your age × target % range</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold">❖</span>
                          <span><strong>Example:</strong> 30 years old → 220-30 = 190 → 50% MHR = 95 BPM</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold">❖</span>
                          <span>Always warm up (3-5 mins) and cool down after each session</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold">❖</span>
                          <span><strong>Talk Test:</strong> You should be able to talk, not sing (LISS), or speak short phrases (MISS/HIIT)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold">❖</span>
                          <span>Feel free to shuffle days based on your energy and schedule</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Topic 9: Your Training Schedule With Cardio */}
              <Card className="overflow-hidden border-l-4 border-l-purple-400">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                  <CardTitle className="text-lg text-gray-900">Your Training Schedule With Cardio</CardTitle>
                  <CardDescription className="text-purple-600 font-semibold text-sm">A gentle weekly rhythm to rebuild strength, core connection, and confidence</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-6">

                    {/* Activity Legend */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                      <div className="bg-pink-100 p-3 rounded-lg border-l-4 border-pink-400">
                        <h5 className="font-semibold text-pink-700 text-sm mb-1">💪 PROGRAM</h5>
                        <p className="text-xs text-pink-600">Core strengthening workouts from your 6-week plan</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-lg border-l-4 border-blue-400">
                        <h5 className="font-semibold text-blue-700 text-sm mb-1">❤️ CARDIO</h5>
                        <p className="text-xs text-green-600">Follow the cardio plan from Topic 8 above</p>
                      </div>
                      <div className="bg-emerald-100 p-3 rounded-lg border-l-4 border-emerald-400">
                        <h5 className="font-semibold text-emerald-700 text-sm mb-1">🌱 REST</h5>
                        <p className="text-xs text-emerald-600">Recovery days with gentle walks or complete rest</p>
                      </div>
                    </div>

                    {/* Mobile Legend */}
                    <div className="block md:hidden mb-6">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-3 text-sm">📱 Mobile Quick Reference</h5>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="text-center">
                            <div className="bg-pink-100 text-pink-700 py-1 px-2 rounded font-medium mb-1">P1-P6</div>
                            <p className="text-gray-600">Program 1-6</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-green-100 text-blue-700 py-1 px-2 rounded font-medium mb-1">C</div>
                            <p className="text-gray-600">Cardio</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-emerald-100 text-emerald-700 py-1 px-2 rounded font-medium mb-1">R</div>
                            <p className="text-gray-600">Rest</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Schedule Example */}
                    <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                      <div className="p-4 text-white" style={{background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'}}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">Example Schedule</span>
                            <h4 className="font-bold text-lg mt-1">Weekly Training Layout</h4>
                          </div>
                          <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                            <span className="block md:hidden">Flexible</span>
                            <span className="hidden md:inline">Adapt to Your Schedule</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-7 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-semibold text-gray-700 mb-2">Mon</div>
                            <div className="bg-pink-100 text-pink-700 py-2 px-1 rounded mb-1">Program</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-700 mb-2">Tue</div>
                            <div className="bg-blue-100 text-blue-700 py-2 px-1 rounded mb-1">Cardio</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-700 mb-2">Wed</div>
                            <div className="bg-pink-100 text-pink-700 py-2 px-1 rounded mb-1">Program</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-700 mb-2">Thu</div>
                            <div className="bg-emerald-100 text-emerald-700 py-2 px-1 rounded mb-1">Rest</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-700 mb-2">Fri</div>
                            <div className="bg-pink-100 text-pink-700 py-2 px-1 rounded mb-1">Program</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-700 mb-2">Sat</div>
                            <div className="bg-blue-100 text-blue-700 py-2 px-1 rounded mb-1">Cardio</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-700 mb-2">Sun</div>
                            <div className="bg-emerald-100 text-emerald-700 py-2 px-1 rounded mb-1">Rest</div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4 text-center">
                          This is just a sample. Feel free to adjust days to fit your life and energy levels.
                        </p>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>

            </div>
          </CardContent>
        )}
      </Card>

      {/* 6-Week Program Section - Note: This is extremely large, continuing with the rest of the programs... */}
      <Card className="overflow-hidden border-l-4 border-pink-400 shadow-xl">
        <CardHeader 
          className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 cursor-pointer transition-all duration-300 relative overflow-hidden"
          onClick={() => toggleProgram('6-week-program')}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            {/* Mobile Layout */}
            <div className="block lg:hidden">
              {/* Program Badge on top */}
              <div className="mb-3">
                <div className="bg-gradient-to-r from-white to-pink-50 text-pink-600 px-3 py-2 rounded-xl font-bold text-xs whitespace-nowrap shadow-lg border-2 border-pink-200 inline-block">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></div>
                    6-WEEK PROGRAM
                  </div>
                </div>
              </div>
              
              {/* Title and Description */}
              <div className="mb-3">
                <div className="text-white font-bold text-lg tracking-tight drop-shadow-md mb-1">
                  Complete 6-Week Core Recovery Journey
                </div>
                <div className="text-pink-100 font-medium text-sm drop-shadow-sm">
                  Progressive strength building program
                </div>
              </div>
              
              {/* Info box and dropdown */}
              <div className="flex items-center justify-between">
                <div className="bg-white bg-opacity-10 px-3 py-2 rounded-lg backdrop-blur-sm flex-1 mr-3">
                  <div className="text-xs text-pink-100 font-bold uppercase tracking-wide">6 Programs</div>
                  <div className="text-xs text-white font-medium">Weeks 1-6 detailed plans</div>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-white to-pink-100 text-pink-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedPrograms['6-week-program'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0 pr-2">
                <div className="bg-gradient-to-r from-white to-pink-50 text-pink-600 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap shadow-lg border-2 border-pink-200 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                    <span>6-WEEK PROGRAM</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 py-2">
                  <CardTitle className="text-2xl text-white font-bold tracking-tight drop-shadow-md leading-tight">
                    Complete 6-Week Core Recovery Journey
                  </CardTitle>
                  <CardDescription className="text-pink-100 font-semibold text-base mt-2 drop-shadow-sm leading-tight">
                    Progressive strength building program
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right bg-white bg-opacity-10 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <div className="text-sm text-pink-100 font-bold uppercase tracking-wide">6 Programs</div>
                  <div className="text-sm text-white font-medium">Weeks 1-6 detailed plans</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-white to-pink-100 text-pink-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedPrograms['6-week-program'] ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {expandedPrograms['6-week-program'] && (
          <CardContent className="p-6 border-t border-pink-100">
            <div className="space-y-6">
              {workoutPrograms.map((program) => (
                <StaticProgramCard
                  key={program.week}
                  program={program}
                  isExpanded={expandedWeeks[program.week] || false}
                  onToggle={() => setExpandedWeeks(prev => ({ ...prev, [program.week]: !prev[program.week] }))}
                />
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Navigation Buttons */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Continue Your Journey</h3>
          <p className="text-sm text-gray-600">Navigate through your recovery program</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {canGoPrevious() && (
            <Button
              variant="outline"
              className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
              data-testid="button-prev-section-programs"
              onClick={navigateToPreviousTab}
            >
              <ChevronLeft className="w-4 h-4" />
              {getNavigationText('prev')}
            </Button>
          )}
          {canGoNext() && (
            <Button
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
              data-testid="button-next-section-programs"
              onClick={navigateToNextTab}
            >
              {getNavigationText('next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">Complete your holistic recovery journey</p>
        </div>
      </div>
    </div>
  );
}
