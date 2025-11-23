import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ChevronLeft, Play } from "lucide-react";
import zoeLogoImage from "@assets/Screenshot_2025-09-22_at_13.03.07-removebg-preview_1758527068639.png";
import yogaMatImage from "@assets/WhatsApp Image 2025-10-04 at 10.26.35_1759554817951.jpeg";
import yogaBlocksImage from "@assets/WhatsApp Image 2025-10-04 at 10.26.43_1759554886354.jpeg";
import miniResistanceBandsImage from "@assets/Screenshot 2025-09-22 at 13.29.57_1758528078677.png";
import miniPilatesBallImage from "@assets/Screenshot 2025-09-22 at 13.30.04_1758528078677.png";
import longResistanceBandImage from "@assets/Screenshot 2025-09-22 at 13.30.13_1758528078677.png";
import swissBallImage from "@assets/Screenshot 2025-09-22 at 13.30.19_1758528078676.png";
import foamRollerImage from "@assets/Screenshot 2025-09-22 at 13.30.27_1758528078676.png";
import type { User } from "@shared/schema";

interface NavigationProps {
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  navigateToNextTab: () => void;
  navigateToPreviousTab: () => void;
  getNavigationText: (direction: 'prev' | 'next') => string;
}

interface WelcomeSectionProps extends NavigationProps {
  user?: User | null;
}

export default function WelcomeSection({
  user,
  canGoNext,
  canGoPrevious,
  navigateToNextTab,
  navigateToPreviousTab,
  getNavigationText
}: WelcomeSectionProps) {
  const [expandedTopics, setExpandedTopics] = useState<{[key: string]: boolean}>({});
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Single Container with Welcome Header and All Topics */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          {/* Welcome Header */}
          <div className="mb-8 text-left">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
              Welcome - Start Here
            </h2>
            <p className="text-sm font-medium text-gray-600 border-l-4 border-pink-400 pl-4 bg-gradient-to-r from-pink-50 to-transparent py-2">
              Essential preparatory information for your core recovery journey
            </p>
          </div>

          {/* Community Support Section - Large Card - Only show if user doesn't have WhatsApp support */}
          {!user?.hasWhatsAppSupport && (
          <div className="mb-8">
            {/* White Container with Shadow */}
            <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full mb-3">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
                <span className="text-green-600 font-semibold text-sm">COMMUNITY SUPPORT ADD-ON</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Want Extra Support on Your Journey?</h2>
              <p className="text-gray-600 text-sm">Join our exclusive WhatsApp community for guidance, motivation, and celebration with fellow moms</p>
            </div>

            {/* WhatsApp Community Card - Collapsible */}
            <Card className="overflow-hidden border-2 border-green-300 shadow-xl bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl">
              <CardHeader 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 cursor-pointer transition-all duration-300 relative overflow-hidden"
                onClick={() => toggleTopic('whatsapp-community')}
              >
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                  <div className="absolute top-1/2 left-1/4 w-6 h-6 bg-white rounded-full"></div>
                </div>
                
                <div className="relative z-10">
                  {/* Mobile Layout */}
                  <div className="block lg:hidden">
                    {/* WhatsApp Badge on top */}
                    <div className="mb-4">
                      <div className="bg-gradient-to-r from-white to-blue-50 text-green-600 px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap shadow-lg border-2 border-green-200 inline-block">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                          </svg>
                          <span>WHATSAPP COMMUNITY</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Title and Description */}
                    <div className="mb-4">
                      <div className="text-white font-bold text-lg tracking-tight drop-shadow-md mb-2 leading-tight">
                        Community Support
                      </div>
                      <div className="text-green-100 font-medium text-sm drop-shadow-sm leading-relaxed">
                        Get guidance, motivation & celebrate wins with Zoe + coaches
                      </div>
                    </div>
                    
                    {/* Price and dropdown */}
                    <div className="flex items-center justify-between">
                      <div className="bg-white bg-opacity-20 px-4 py-3 rounded-xl backdrop-blur-sm border border-white border-opacity-30">
                        <div className="text-green-100 font-bold text-xs uppercase tracking-wide mb-1">3 Months Access</div>
                        <div className="text-white font-bold text-xl">₹1000</div>
                      </div>
                      <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedTopics['whatsapp-community'] ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:flex lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0 pr-2">
                      <div className="bg-gradient-to-r from-white to-blue-50 text-green-600 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap shadow-lg border-2 border-green-200 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                          </svg>
                          <span>WHATSAPP COMMUNITY</span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 py-2">
                        <CardTitle className="text-2xl text-white font-bold tracking-tight drop-shadow-md leading-tight">
                          Community Support Add-On
                        </CardTitle>
                        <CardDescription className="text-green-100 font-semibold text-base mt-2 drop-shadow-sm leading-tight">
                          Get guidance, motivation & celebrate wins with Zoe + coaches
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right bg-white bg-opacity-20 px-4 py-3 rounded-lg backdrop-blur-sm border border-white border-opacity-30">
                        <div className="text-sm text-green-100 font-bold uppercase tracking-wide">3 Months Access</div>
                        <div className="text-lg text-white font-bold">₹1000</div>
                      </div>
                      <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white">
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedTopics['whatsapp-community'] ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {expandedTopics['whatsapp-community'] && (
                <CardContent className="p-6 border-t border-blue-100">
                  <div className="space-y-6">
                    {/* Hero Description */}
                    <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-green-200">
                      <h3 className="text-xl font-bold text-green-600 mb-3">
                        💙 Your Safe Space for Support & Celebration
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Healing your core is powerful — but doing it with a community of moms (and with Zoe + her team cheering you on) makes it so much more fun! This isn't just another WhatsApp group... it's your safe space to share progress, ask questions, and stay motivated.
                      </p>
                      <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                        <span className="text-green-600 font-semibold">EXCLUSIVE ACCESS</span>
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    {/* Benefits Grid - Responsive */}
                    <div className="grid md:grid-cols-2 gap-6">
                      
                      {/* What You'll Get Inside */}
                      <div className="bg-white border border-green-200 rounded-lg p-5">
                        <h4 className="text-lg font-bold text-green-600 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          What You'll Get Inside
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            <div>
                              <strong>Zoe + Coaches in the Group</strong> - Direct access to guidance, motivation, and occasional "pep talks."
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            <div>
                              <strong>Community Energy</strong> - You'll be surrounded by moms just like you — starting, restarting, and celebrating wins.
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            <div>
                              <strong>Accountability Made Easy</strong> - Stay consistent with reminders, challenges, and check-ins.
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            <div>
                              <strong>The Real Talk Space</strong> - Where you can share struggles (yes, even the messy ones) and get support without judgment.
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            <div>
                              <strong>Tips & Surprises</strong> - Expect quick hacks, fun challenges, and mini-celebrations along the way.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Who Is It For */}
                      <div className="bg-white border border-green-200 rounded-lg p-5">
                        <h4 className="text-lg font-bold text-green-600 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                          </svg>
                          Who Is It For
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            <div>You've started Heal Your Core and want ongoing support</div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            <div>You're unsure if you're 'doing it right' and want guidance</div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            <div>You love being part of a tribe that celebrates wins together</div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            <div>You want to stay consistent and actually finish the program</div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            <div>You value having expert answers at your fingertips</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* How It Works */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-green-200 rounded-lg p-5">
                      <h4 className="text-lg font-bold text-green-600 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                        </svg>
                        How It Works
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                            <div>Pay ₹1000 for 3 months access</div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                            <div>Select and purchase your 3-month WhatsApp Community Support add-on</div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                            <div>Receive your exclusive invite link to the private group (This may take a few days)</div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                            <div>Join anytime — whether you're on Day 1 or Week 6 of your Heal My Core journey</div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
                            <div>A Community Coach helps manage the group to keep it useful, supportive, and positive</div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">6</div>
                            <div>Renew if you'd like to continue beyond your first 3 months</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center bg-white border-2 border-green-300 rounded-lg p-6">
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-green-600 mb-2">₹1000</div>
                        <div className="text-gray-600 text-sm mb-1">3 months of community support</div>
                        <p className="text-gray-500 text-xs">Join your supportive community of moms today!</p>
                      </div>
                      <Button 
                        onClick={() => window.open('https://www.strongerwithzoe.in/products/whatsapp-community', '_blank')}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2 w-full sm:w-auto"
                        data-testid="button-join-whatsapp-community"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                        </svg>
                        <span className="hidden sm:inline">Join WhatsApp Community</span>
                        <span className="sm:hidden">Join Community</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
            </div> {/* End White Container */}
          </div>
          )}

          {/* All Topics with Line Dividers */}
          <div className="space-y-0">
            {/* Topic 1: Welcome from Zoe */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">1</span>
                  <h3 className="text-[15px] font-semibold text-left">Welcome from Zoe</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('welcome-zoe')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-welcome-zoe"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['welcome-zoe'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['welcome-zoe'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    {/* Zoe Image */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border max-w-md">
                        <img 
                          src={zoeLogoImage} 
                          alt="Zoe - Fitness instructor"
                          className="w-full h-auto rounded"
                          data-testid="img-zoe-logo"
                        />
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-gray-900">Hey Mama,</p>
                    
                    <p className="text-sm text-gray-700 leading-relaxed">
                      I'm so glad you're here. Whether you're 6 weeks postpartum or years after delivery, this journey is for you. You may feel lost, overwhelmed, or unsure where to start—but you're in the right place.
                    </p>
                    
                    <p className="text-sm text-gray-700 leading-relaxed">
                      This program was designed to help you <strong className="text-pink-500">reconnect with your body, rebuild your core, and feel empowered in your strength again.</strong> No jumping into crunches, no quick fixes—just gentle, purposeful recovery to help you feel like yourself again.
                    </p>
                    
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Here's what to expect over the next 6 weeks:
                    </p>
                    
                    <ul className="ml-6 list-disc space-y-2 text-sm text-gray-700">
                      <li>A solid understanding of what happened to your body during pregnancy + how to heal</li>
                      <li>Core connection workouts designed to rebuild your foundation safely</li>
                      <li>Breathing + pelvic floor support integrated with every session</li>
                      <li>Nutritional guidance to fuel healing from the inside</li>
                      <li>A clear path toward returning to movement you love</li>
                    </ul>
                    
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Your journey is not linear.</strong> Some days will feel easier than others, and that's completely okay. The fact that you're here shows your commitment to yourself—and that's everything.
                    </p>
                    
                    <p className="text-sm font-semibold text-gray-900">
                      Let's rebuild together. You've got this, Mama.
                    </p>
                    
                    <p className="text-sm italic text-gray-600">— Zoe 💛</p>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 2: How This Program Works */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">2</span>
                  <h3 className="text-[15px] font-semibold text-left">How This Program Works</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('how-program-works')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-how-program-works"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['how-program-works'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['how-program-works'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    <p className="text-sm">
                      This program is split into <strong>six progressive weeks</strong>, each building on the previous one. You'll strengthen your core, improve mobility, and rebuild confidence step-by-step.
                    </p>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">Week-by-Week Breakdown:</h4>
                      <ul className="ml-4 list-disc space-y-2 text-sm">
                        <li><strong>Week 1–2:</strong> Foundation & Reconnection — Gentle breath work, core engagement, and mobility to wake up your deep core</li>
                        <li><strong>Week 3–4:</strong> Building Awareness & Control — Slow, intentional movement + stability work to strengthen your base</li>
                        <li><strong>Week 5–6:</strong> Strength & Progression — Layering in more movement, resistance, and challenge to build real functional strength</li>
                      </ul>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">What to Expect Each Week:</h4>
                      <ul className="ml-4 list-disc space-y-2 text-sm">
                        <li>3 structured workouts (approx. 20-30 mins each)</li>
                        <li>Daily breathwork + core activation practice (5-10 mins)</li>
                        <li>Optional cardio integration (starting Week 3 if cleared)</li>
                        <li>Weekly check-ins and progress reminders</li>
                      </ul>
                    </div>
                    
                    <div className="text-center p-3 bg-primary/10 rounded">
                      <p className="italic font-medium text-sm">You don't have to be perfect—just present. Consistency beats perfection every time.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 3: Who This Program Is For */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">3</span>
                  <h3 className="text-[15px] font-semibold text-left">Who This Program Is For</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('who-program-for')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-who-program-for"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['who-program-for'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['who-program-for'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    <p className="text-sm font-semibold text-primary">
                      This program is for you if:
                    </p>
                    
                    <ul className="ml-4 list-disc space-y-2 text-sm">
                      <li>You've been cleared by your doctor to begin gentle exercise (usually after 6 weeks postpartum for vaginal delivery, 8–12 weeks for C-section)</li>
                      <li>You have diastasis recti or suspect you do</li>
                      <li>You feel disconnected from your core or struggle with "coning" or doming during movement</li>
                      <li>You experience back pain, pelvic instability, or pelvic floor symptoms like leaking</li>
                      <li>You're unsure where to start and need structured, safe guidance</li>
                      <li>You're months or even years postpartum and still haven't fully recovered</li>
                    </ul>
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <p className="font-semibold text-yellow-800 mb-2">Important Note:</p>
                      <p className="text-sm text-yellow-700">
                        If you have severe diastasis (gap wider than 3 fingers), prolapse, or other complications, always consult with a pelvic floor physiotherapist before starting any program.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 4: Before You Begin: What You Need to Know */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">4</span>
                  <h3 className="text-[15px] font-semibold text-left">Before You Begin: What You Need to Know</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('before-you-begin')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-before-you-begin"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['before-you-begin'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['before-you-begin'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">✅ Get Medical Clearance</h4>
                      <p className="text-sm">Always check with your healthcare provider before starting any postpartum exercise program.</p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">📐 Check for Diastasis Recti</h4>
                      <p className="text-sm">It's helpful to know if you have diastasis before you begin—but even if you don't, this program will benefit you. You can perform a self-check or see a physiotherapist for an assessment.</p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">🧘‍♀️ Start with What You Have</h4>
                      <p className="text-sm">You don't need a gym or fancy equipment. A yoga mat, comfortable clothes, and a quiet space are enough. Optional items like a pilates ball or resistance band can help later on.</p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">🌟 Set Realistic Expectations</h4>
                      <p className="text-sm">
                        Recovery takes time. You might not see instant changes, but consistent practice will bring results. Trust your body. Trust the process.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 5: Program Essentials: What You Need */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">5</span>
                  <h3 className="text-[15px] font-semibold text-left">Program Essentials: What You Need</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('program-essentials')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-program-essentials"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['program-essentials'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['program-essentials'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-5">
                    <p className="text-sm">
                      You don't need much—just the essentials. Here's what you'll use:
                    </p>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-3">Essential Equipment:</h4>
                      <ul className="ml-4 list-disc space-y-2 text-sm">
                        <li><strong>Yoga mat</strong> - For floor exercises and comfort</li>
                        <li><strong>Comfortable workout clothes</strong> - Breathable and non-restrictive</li>
                        <li><strong>Water bottle</strong> - Stay hydrated throughout</li>
                      </ul>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-3">Optional Equipment (helpful for progression):</h4>
                      <ul className="ml-4 list-disc space-y-2 text-sm">
                        <li><strong>Pilates/mini ball</strong> - For deep core activation</li>
                        <li><strong>Resistance bands</strong> (light to medium) - For strengthening work</li>
                        <li><strong>Yoga blocks</strong> - For support and modifications</li>
                        <li><strong>Small hand weights</strong> (1-3kg) - For later weeks if desired</li>
                      </ul>
                    </div>
                    
                    <p className="text-sm italic text-muted-foreground">
                      Note: Don't rush to buy everything. Start with the basics and add as needed.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Line Divider with Shadow */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent rounded shadow-sm opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Topic 6: Equipment Showcase */}
            <div>
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold text-xs shrink-0">6</span>
                  <h3 className="text-[15px] font-semibold text-left">Equipment Showcase</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTopic('equipment-showcase')}
                  className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-pink-700 p-0"
                  data-testid="button-toggle-equipment-showcase"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${expandedTopics['equipment-showcase'] ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              {expandedTopics['equipment-showcase'] && (
                <div className="pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-6">
                    <p className="text-sm mb-6">
                      Here's a visual guide to the equipment you may use throughout this program. Remember, these are optional additions to enhance your workout—not requirements!
                    </p>
                    
                    {/* Grid of Equipment Images */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Row 1 - Mat, Blocks, Mini Bands */}
                      <div className="text-center group">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-10 mb-4 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-purple-200">
                          <img 
                            src={yogaMatImage} 
                            alt="Yoga mat" 
                            className="w-56 h-56 object-contain filter drop-shadow-lg"
                          />
                        </div>
                        <p className="font-semibold text-lg text-gray-800">Yoga Mat</p>
                        <p className="text-sm text-gray-600 mt-1">Essential foundation for all exercises</p>
                      </div>
                      
                      <div className="text-center group">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-10 mb-4 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-blue-200">
                          <img 
                            src={yogaBlocksImage} 
                            alt="Yoga blocks" 
                            className="w-56 h-56 object-contain filter drop-shadow-lg"
                          />
                        </div>
                        <p className="font-semibold text-lg text-gray-800">Yoga Blocks</p>
                        <p className="text-sm text-gray-600 mt-1">Support and modifications</p>
                      </div>
                      
                      <div className="text-center group">
                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-10 mb-4 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-pink-200">
                          <img 
                            src={miniResistanceBandsImage} 
                            alt="Mini resistance bands" 
                            className="w-56 h-56 object-contain filter drop-shadow-lg"
                          />
                        </div>
                        <p className="font-semibold text-lg text-gray-800">Mini Resistance Bands</p>
                        <p className="text-sm text-gray-600 mt-1">Activation and strengthening</p>
                      </div>
                      
                      {/* Row 2 - Pilates Ball, Long Band, Swiss Ball */}
                      <div className="text-center group">
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-10 mb-4 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-orange-200">
                          <img 
                            src={miniPilatesBallImage} 
                            alt="Pilates ball" 
                            className="w-56 h-56 object-contain filter drop-shadow-lg"
                          />
                        </div>
                        <p className="font-semibold text-lg text-gray-800">Mini Pilates Ball</p>
                        <p className="text-sm text-gray-600 mt-1">Deep core activation</p>
                      </div>
                      
                      <div className="text-center group">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-10 mb-4 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-green-200">
                          <img 
                            src={longResistanceBandImage} 
                            alt="Long resistance band" 
                            className="w-56 h-56 object-contain filter drop-shadow-lg"
                          />
                        </div>
                        <p className="font-semibold text-lg text-gray-800">Long Resistance Band</p>
                        <p className="text-sm text-gray-600 mt-1">Progressive resistance training</p>
                      </div>
                      
                      <div className="text-center group">
                        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-10 mb-4 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-teal-200">
                          <img 
                            src={swissBallImage} 
                            alt="Swiss ball" 
                            className="w-56 h-56 object-contain filter drop-shadow-lg"
                          />
                        </div>
                        <p className="font-semibold text-lg text-gray-800">Medium Swiss Ball</p>
                        <p className="text-sm text-gray-600 mt-1">Balance and stability work</p>
                      </div>
                      
                      {/* Row 3 - Foam Roller centered */}
                      <div className="text-center group md:col-span-2 lg:col-span-1 lg:col-start-2">
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-10 mb-4 aspect-square flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-slate-200">
                          <img 
                            src={foamRollerImage} 
                            alt="Foam roller" 
                            className="w-56 h-56 object-contain filter drop-shadow-lg"
                          />
                        </div>
                        <p className="font-semibold text-lg text-gray-800">Foam Roller</p>
                        <p className="text-sm text-gray-600 mt-1">Muscle recovery and release</p>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h5 className="font-semibold text-primary mb-4">BONUS TIPS:</h5>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>Find a quiet space, but don't stress if it's not perfect.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>Keep water nearby, wear comfortable attire.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">❖</span>
                          <span>Treat these sessions like acts of care, not chores.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {canGoPrevious() && (
                <Button
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
                  data-testid="button-previous-section"
                  onClick={navigateToPreviousTab}
                >
                  <ChevronLeft className="w-4 h-4" />
                  {getNavigationText('prev')}
                </Button>
              )}
              {canGoNext() && (
                <Button
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 sm:px-8 py-4 sm:py-3 text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
                  data-testid="button-next-section"
                  onClick={navigateToNextTab}
                >
                  {getNavigationText('next')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">Build the foundation for your recovery journey</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
