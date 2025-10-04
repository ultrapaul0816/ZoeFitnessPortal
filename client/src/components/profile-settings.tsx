import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Info, Globe, BookOpen, CreditCard, User, LogOut, ChevronRight, ArrowRight, ArrowLeft, Mail, HelpCircle, Copy, CheckCircle2, Circle, Target, Clock, Dumbbell, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  evaluateCompleteness, 
  getCurrentProfileData, 
  saveProfileData,
  clearPromptState,
  getFirstMissingFieldName,
  type ProfileData 
} from "@/lib/profile-completeness";
import type { User as UserType } from "@shared/schema";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUserUpdate: (user: UserType) => void;
  initialView?: 'menu' | 'profile' | 'purchases' | 'support';
}

export default function ProfileSettings({ isOpen, onClose, user, onUserUpdate, initialView = 'menu' }: ProfileSettingsProps) {
  const [location, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState<'menu' | 'profile' | 'purchases' | 'support'>(initialView);
  const { toast } = useToast();
  
  // Fetch user's purchased programs
  const { data: memberPrograms = [], isLoading: isLoadingPrograms } = useQuery<any[]>({
    queryKey: ['/api/member-programs', user.id],
    enabled: !!user.id && currentView === 'purchases',
  });
  
  const [profileData, setProfileData] = useState<ProfileData>({
    country: '',
    bio: '',
    socials: '',
    dueDate: '',
    postpartumTime: '',
    fullName: '',
    email: '',
    photo: '',
    newsUpdates: true,
    promotions: true,
    communityUpdates: true,
    transactionalEmails: false
  });
  const [profileCompleteness, setProfileCompleteness] = useState<ReturnType<typeof evaluateCompleteness> | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLButtonElement>(null);

  const [renderOpen, setRenderOpen] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // Load profile data from localStorage when component opens
  useEffect(() => {
    if (isOpen) {
      const currentProfile = getCurrentProfileData();
      setProfileData(currentProfile);
      
      // Always sync selectedPhoto with stored data (clear if no photo saved)
      setSelectedPhoto(currentProfile.photo || null);
      
      // Evaluate completeness
      const completeness = evaluateCompleteness(currentProfile);
      setProfileCompleteness(completeness);
      
      setRenderOpen(true);
      setIsClosing(false);
      
      // Focus on first missing field after a short delay to allow render
      setTimeout(() => {
        if (!completeness.isComplete) {
          const firstMissingField = getFirstMissingFieldName(completeness);
          if (firstMissingField === 'country') {
            countryRef.current?.focus();
          }
        }
      }, 100);
    } else if (renderOpen) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setRenderOpen(false);
      }, 600); // Allow time for staggered exit animation
      return () => clearTimeout(timer);
    }
  }, [isOpen, renderOpen]);

  // Update completeness when profile data changes
  useEffect(() => {
    const completeness = evaluateCompleteness(profileData);
    setProfileCompleteness(completeness);
  }, [profileData]);

  // Update current view when initialView prop changes
  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);

  if (!renderOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    onClose();
    window.location.href = "/";
  };

  const handleSaveProfile = () => {
    // Save profile data to localStorage
    saveProfileData(profileData);
    
    const completeness = evaluateCompleteness(profileData);
    
    // Show success feedback
    if (completeness.isComplete) {
      toast({
        title: "Profile Complete! 🎉",
        description: "Your profile has been completed successfully. You're all set!",
        duration: 4000,
      });
      
      // Clear prompt state since profile is now complete
      clearPromptState();
    } else {
      toast({
        title: "Profile Updated",
        description: `Profile saved. ${completeness.missingRequiredCount} required field${completeness.missingRequiredCount > 1 ? 's' : ''} remaining.`,
        duration: 3000,
      });
    }
    
    // Update completeness state
    setProfileCompleteness(completeness);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (JPG, PNG, GIF, etc.)",
          variant: "destructive",
          duration: 3000,
        });
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
          duration: 3000,
        });
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedPhoto(result);
        // Save photo to profileData for persistence
        setProfileData(prev => ({ ...prev, photo: result }));
        toast({
          title: "Photo Updated",
          description: "Your profile photo has been updated successfully!",
          duration: 3000,
        });
      };
      reader.readAsDataURL(file);
    }
    
    // Reset the file input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 
    'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Ireland', 
    'New Zealand', 'Japan', 'South Korea', 'Singapore', 'India', 'Brazil', 'Mexico'
  ];

  if (currentView === 'support') {
    return (
      <div 
        className="fixed top-16 left-0 right-0 bottom-0 z-50 bg-gray-50 animate-in scale-in-95 fade-in duration-300" 
        data-testid="page-support-settings"
      >
        <div className="w-full h-full overflow-y-auto p-6">
          {/* Back Button */}
          <button 
            onClick={() => setCurrentView('menu')}
            className="group relative mb-6 flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-pink-600 transition-all duration-300 transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700 transition-colors duration-300">
              Back to Menu
            </span>
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/0 to-pink-600/0 group-hover:from-pink-400/10 group-hover:to-pink-600/10 transition-all duration-300 pointer-events-none"></div>
          </button>

          {/* Support Center */}
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Need Help?</h2>
              <p className="text-gray-600 mb-6">
                We're here to support you on your wellness journey. Get in touch with our friendly team for any questions or assistance.
              </p>
            </div>

            {/* Support Email Section */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-6 mb-6 border border-pink-200">
              <div className="flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-pink-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">support@strongerwithzoe.in</span>
                  <button 
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText('support@strongerwithzoe.in');
                        toast({
                          title: "Email Copied!",
                          description: "support@strongerwithzoe.in has been copied to your clipboard",
                          duration: 3000,
                        });
                      } catch (err) {
                        // Fallback for browsers that don't support clipboard API
                        try {
                          const textArea = document.createElement('textarea');
                          textArea.value = 'support@strongerwithzoe.in';
                          textArea.style.position = 'fixed';
                          textArea.style.left = '-999999px';
                          textArea.style.top = '-999999px';
                          document.body.appendChild(textArea);
                          textArea.focus();
                          textArea.select();
                          document.execCommand('copy');
                          document.body.removeChild(textArea);
                          toast({
                            title: "Email Copied!",
                            description: "support@strongerwithzoe.in has been copied to your clipboard",
                            duration: 3000,
                          });
                        } catch (fallbackErr) {
                          toast({
                            title: "Copy Failed",
                            description: "Please manually copy: support@strongerwithzoe.in",
                            variant: "destructive",
                            duration: 4000,
                          });
                        }
                      }
                    }}
                    className="p-2 text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-lg transition-colors duration-200"
                    title="Copy email address"
                    data-testid="button-copy-email"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-3">
                Send us an email and we'll get back to you within 24 hours
              </p>
              
              {/* Send Email Button - Moved here from bottom */}
              <div className="mt-4">
                <Button 
                  onClick={() => window.open('https://mail.google.com/mail/u/0/?to=support@strongerwithzoe.in&su=Support+Request&body=Hi+Stronger+With+Zoe+Team,%0D%0A%0D%0AI+would+like+to+get+support+with:%0D%0A%0D%0A[Please+describe+your+question+or+issue+here]%0D%0A%0D%0AThank+you!&tf=cm', '_blank')}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 inline-flex items-center"
                  data-testid="button-contact-support"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>

            {/* WhatsApp Community Support Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border border-green-200">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">WhatsApp Community</h3>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-center">
                  <p className="text-base font-medium text-gray-900 mb-2">Join our exclusive WhatsApp community!</p>
                  <p className="text-sm text-gray-600 mb-4">Get personalized guidance, motivation & celebrate wins with Zoe + coaches</p>
                  <div className="text-sm text-green-600 mb-4">
                    <span className="font-semibold">₹1000</span> for 3 months
                  </div>
                  <Button 
                    onClick={() => window.open('https://www.strongerwithzoe.in/products/whatsapp-community', '_blank')}
                    className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center mx-auto"
                    data-testid="button-join-whatsapp-community"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                    </svg>
                    Join Community
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-3 text-center">
                Get instant support and connect with other mamas on their recovery journey
              </p>
            </div>

            {/* Additional Support Info */}
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response Time</h4>
                <p className="text-sm text-gray-600">We typically respond within 24 hours during business days</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">What to Include</h4>
                <p className="text-sm text-gray-600">Your account email and a detailed description of your question</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'purchases') {
    return (
      <div 
        className="fixed top-16 left-0 right-0 bottom-0 z-50 bg-gray-50 animate-in scale-in-95 fade-in duration-300" 
        data-testid="page-purchases-settings"
      >
        <div className="w-full h-full overflow-y-auto p-6">
          {/* Back Button */}
          <button 
            onClick={() => setCurrentView('menu')}
            className="group relative mb-6 flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-pink-600 transition-all duration-300 transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700 transition-colors duration-300">
              Back to Menu
            </span>
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/0 to-pink-600/0 group-hover:from-pink-400/10 group-hover:to-pink-600/10 transition-all duration-300 pointer-events-none"></div>
          </button>


          {/* My Programs */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">My Programs</h2>
            
            {isLoadingPrograms ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                <span className="ml-3 text-gray-600">Loading your programs...</span>
              </div>
            ) : memberPrograms.length > 0 ? (
              <div className="space-y-4">
                {memberPrograms.map((memberProgram: any) => {
                  const { program } = memberProgram;
                  const purchaseDate = memberProgram.purchaseDate ? new Date(memberProgram.purchaseDate) : null;
                  const expiryDate = memberProgram.expiryDate ? new Date(memberProgram.expiryDate) : null;
                  const isPurchaseDateValid = purchaseDate && !isNaN(purchaseDate.getTime());
                  const isExpiryDateValid = expiryDate && !isNaN(expiryDate.getTime());
                  
                  // Convert price from cents to rupees
                  const displayPrice = program.price ? (program.price / 100).toLocaleString('en-IN') : null;
                  
                  // Calculate progress percentage
                  const progressPercentage = program.workoutCount ? Math.round((memberProgram.progress || 0) / program.workoutCount * 100) : 0;
                  
                  return (
                    <div key={memberProgram.id} className="bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                          {/* Program Image */}
                          <div className="flex-shrink-0 mx-auto lg:mx-0">
                            {program.coverImage ? (
                              <img 
                                src={program.coverImage}
                                alt={program.title}
                                className="w-20 h-20 object-cover rounded-lg shadow-md"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-20 h-20 bg-pink-500 rounded-lg shadow-md flex items-center justify-center ${program.coverImage ? 'hidden' : ''}`}>
                              <BookOpen className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          
                          {/* Program Details */}
                          <div className="flex-1 min-w-0 text-center lg:text-left">
                            {/* Title and Status */}
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-3 lg:space-y-0 mb-4">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                  {program.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {program.description}
                                </p>
                              </div>
                              
                              {/* Active Badge */}
                              <div className="flex justify-center lg:justify-end">
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                  Active
                                </span>
                              </div>
                            </div>
                            
                            {/* Program Info */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm">
                              <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-600">
                                <BookOpen className="w-4 h-4 text-pink-500" />
                                <span>{program.duration || '6 Weeks'}</span>
                              </div>
                              <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-600">
                                <Target className="w-4 h-4 text-pink-500" />
                                <span className="capitalize">{program.level || 'Postnatal'}</span>
                              </div>
                              <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-600">
                                <span className="w-4 h-4 bg-pink-500 rounded text-white text-xs flex items-center justify-center font-bold">
                                  {program.workoutCount || 22}
                                </span>
                                <span>Workouts</span>
                              </div>
                              {displayPrice && (
                                <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-600">
                                  <CreditCard className="w-4 h-4 text-pink-500" />
                                  <span className="font-semibold text-green-700">₹{displayPrice}</span>
                                </div>
                              )}
                              <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-600">
                                <User className="w-4 h-4 text-pink-500" />
                                <span className="text-xs">
                                  {isPurchaseDateValid ? purchaseDate.toLocaleDateString('en-GB', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    year: 'numeric' 
                                  }) : '23 Sept 2025'}
                                </span>
                              </div>
                              {isExpiryDateValid && (
                                <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-600">
                                  <Clock className="w-4 h-4 text-pink-500" />
                                  <span className="text-xs">
                                    Expires {expiryDate.toLocaleDateString('en-GB', { 
                                      day: 'numeric', 
                                      month: 'short', 
                                      year: 'numeric' 
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            
                            {/* Equipment */}
                            {program.equipment && (
                              <div className="mb-4 bg-gray-50 rounded-lg p-3 border">
                                <div className="flex items-center space-x-2">
                                  <Dumbbell className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-700">Equipment: {program.equipment}</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Continue Button */}
                            <div className="flex justify-center lg:justify-start">
                              <Button 
                                onClick={() => {
                                  if (program.name === "Your Postpartum Strength Recovery Program") {
                                    window.location.href = "/heal-your-core";
                                  } else {
                                    window.location.href = "/dashboard";
                                  }
                                }}
                                className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                                data-testid={`button-access-program-${program.id}`}
                              >
                                <Play className="w-4 h-4" />
                                <span>Continue Program</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Found</h3>
                <p className="text-gray-600 mb-6">
                  You haven't enrolled in any programs yet. Explore our programs to get started on your wellness journey.
                </p>
                <Button 
                  onClick={() => {
                    window.location.href = '/library';
                  }}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                >
                  Browse Programs
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'profile') {
    return (
      <div 
        className="fixed top-16 left-0 right-0 bottom-0 z-50 bg-gray-50 animate-in scale-in-95 fade-in duration-300" 
        data-testid="page-profile-settings"
      >
        <div className="w-full h-full overflow-y-auto p-6">
          {/* Back Button */}
          <button 
            onClick={() => setCurrentView('menu')}
            className="group relative mb-6 flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-pink-600 transition-all duration-300 transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700 transition-colors duration-300">
              Back to Menu
            </span>
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/0 to-pink-600/0 group-hover:from-pink-400/10 group-hover:to-pink-600/10 transition-all duration-300 pointer-events-none"></div>
          </button>

          {/* Profile Completion Progress */}
          {profileCompleteness && !profileCompleteness.isComplete && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
              {/* Header with percentage */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">Profile Progress</h3>
                <span className="text-2xl font-bold text-pink-600">{profileCompleteness.completionPercentage}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompleteness.completionPercentage}%` }}
                />
              </div>

              {/* Fields list */}
              <div className="space-y-1.5 text-sm">
                {profileCompleteness.requiredFields.map((field) => (
                  <div key={field.field} className="flex items-center gap-3 text-gray-700">
                    {field.completed ? (
                      <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                    ) : (
                      <span className="text-gray-300 flex-shrink-0">−</span>
                    )}
                    <span className={field.completed ? 'line-through text-gray-400' : ''}>
                      {field.label}
                    </span>
                  </div>
                ))}
                
                {profileCompleteness.optionalFields.length > 0 && (
                  <>
                    <div className="pt-2 pb-1">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Optional</span>
                    </div>
                    {profileCompleteness.optionalFields.map((field) => (
                      <div key={field.field} className="flex items-center gap-3 text-gray-500">
                        {field.completed ? (
                          <span className="text-blue-500 font-bold flex-shrink-0">✓</span>
                        ) : (
                          <span className="text-gray-200 flex-shrink-0">−</span>
                        )}
                        <span className={field.completed ? 'line-through text-gray-300' : ''}>
                          {field.label}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Profile Complete Success Message */}
          {profileCompleteness && profileCompleteness.isComplete && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Complete! 🎉</h3>
                  <p className="text-sm text-gray-600">
                    Your profile is 100% complete. You're all set for the best experience!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* My Public Info */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">My Public Info</h2>
            <p className="text-gray-600 mb-6">
              Shown when you participate in our community or comment on videos and live events.
            </p>

            {/* Avatar */}
            <div className="flex items-center space-x-4 mb-6">
              {selectedPhoto ? (
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                  <img 
                    src={selectedPhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-2xl font-medium">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                data-testid="input-profile-photo"
              />
              <Button 
                variant="secondary" 
                className="bg-gray-400 text-white hover:bg-gray-500"
                onClick={handlePhotoClick}
                data-testid="button-change-photo"
              >
                Change
              </Button>
            </div>

            {/* Country */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="country">Country *</Label>
              <Select value={profileData.country} onValueChange={(value) => setProfileData(prev => ({...prev, country: value}))}>
                <SelectTrigger 
                  ref={countryRef}
                  className={!profileData.country ? 'ring-2 ring-pink-500 ring-opacity-50' : ''}
                >
                  <SelectValue placeholder="Select Your Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bio */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({...prev, bio: e.target.value}))}
                className="min-h-[100px]"
              />
            </div>

            {/* Socials */}
            <div className="space-y-2">
              <Label htmlFor="socials">Socials</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="socials"
                  type="url"
                  placeholder="http://example.com"
                  value={profileData.socials}
                  onChange={(e) => setProfileData(prev => ({...prev, socials: e.target.value}))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* My Private Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">My Private Info</h2>

            {/* Full Name */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={profileData.fullName || ''}
                onChange={(e) => setProfileData(prev => ({...prev, fullName: e.target.value}))}
                className={!profileData.fullName ? 'ring-2 ring-pink-500 ring-opacity-50' : ''}
              />
            </div>

            {/* Email */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email || ''}
                onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                className={!profileData.email ? 'ring-2 ring-pink-500 ring-opacity-50' : ''}
              />
            </div>

          </div>


          {/* Secure Sign In */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Secure sign in</h2>
            <p className="text-gray-600 mb-6">Manage your password</p>

            <div className="space-y-2">
              <Label className="text-gray-700">Password</Label>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Set new password</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Save Changes Button */}
          <Button 
            onClick={handleSaveProfile}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 group"
            data-testid="button-save-profile"
          >
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Save Changes</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed top-16 left-0 right-0 bottom-0 z-50 bg-white animate-in slide-in-from-top-4 fade-in duration-300" 
      data-testid="page-profile-settings"
    >
      <div className="w-full h-full overflow-y-auto">
        {/* Menu Items */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-6">
          <div className="flex flex-col space-y-3">
            {/* Profile */}
            <div className="flex justify-start">
              <button 
                className="relative inline-flex items-center space-x-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:shadow-lg hover:shadow-pink-200/50 hover:border hover:border-pink-300 border border-transparent transition-all duration-300 group py-3 pl-3 pr-4 rounded-2xl animate-in scale-in-95 fade-in duration-400 overflow-hidden"
                style={{ animationDelay: '80ms' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentView('profile');
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-10 group-hover:animate-in group-hover:slide-in-from-top-2 transition-all duration-300 rounded-2xl"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-pink-300 relative z-10">
                  <User className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 group-hover:translate-x-2 transition-all duration-300 relative z-10">Profile</span>
                <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 ml-2">
                  <ChevronRight className="w-4 h-4 text-pink-500" />
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="flex justify-start my-2 pl-3">
              <div className="w-40 h-px bg-gradient-to-r from-pink-300 via-pink-300 to-transparent shadow-sm"></div>
            </div>

            {/* My Library */}
            <div className="flex justify-start">
              <button 
                className="relative inline-flex items-center space-x-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:shadow-lg hover:shadow-pink-200/50 hover:border hover:border-pink-300 border border-transparent transition-all duration-300 group py-3 pl-3 pr-4 rounded-2xl animate-in scale-in-95 fade-in duration-400 overflow-hidden"
                style={{ animationDelay: '160ms' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                  setLocation("/my-library");
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-10 group-hover:animate-in group-hover:slide-in-from-top-2 transition-all duration-300 rounded-2xl"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-pink-300 relative z-10">
                  <BookOpen className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 group-hover:translate-x-2 transition-all duration-300 relative z-10">My Library</span>
                <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 ml-2">
                  <ChevronRight className="w-4 h-4 text-pink-500" />
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="flex justify-start my-2 pl-3">
              <div className="w-40 h-px bg-gradient-to-r from-pink-300 via-pink-300 to-transparent shadow-sm"></div>
            </div>

            {/* Purchases & Payment */}
            <div className="flex justify-start">
              <button 
                className="relative inline-flex items-center space-x-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:shadow-lg hover:shadow-pink-200/50 hover:border hover:border-pink-300 border border-transparent transition-all duration-300 group py-3 pl-3 pr-4 rounded-2xl animate-in scale-in-95 fade-in duration-400 overflow-hidden"
                style={{ animationDelay: '240ms' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentView('purchases');
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-10 group-hover:animate-in group-hover:slide-in-from-top-2 transition-all duration-300 rounded-2xl"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-pink-300 relative z-10">
                  <CreditCard className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 group-hover:translate-x-2 transition-all duration-300 relative z-10">Purchases</span>
                <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 ml-2">
                  <ChevronRight className="w-4 h-4 text-pink-500" />
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="flex justify-start my-2 pl-3">
              <div className="w-40 h-px bg-gradient-to-r from-pink-300 via-pink-300 to-transparent shadow-sm"></div>
            </div>

            {/* Support */}
            <div className="flex justify-start">
              <button 
                className="relative inline-flex items-center space-x-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:shadow-lg hover:shadow-pink-200/50 hover:border hover:border-pink-300 border border-transparent transition-all duration-300 group py-3 pl-3 pr-4 rounded-2xl animate-in scale-in-95 fade-in duration-400 overflow-hidden"
                style={{ animationDelay: '320ms' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentView('support');
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-10 group-hover:animate-in group-hover:slide-in-from-top-2 transition-all duration-300 rounded-2xl"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-pink-300 relative z-10">
                  <HelpCircle className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 group-hover:translate-x-2 transition-all duration-300 relative z-10">Support</span>
                <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 ml-2">
                  <ChevronRight className="w-4 h-4 text-pink-500" />
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="flex justify-start my-2 pl-3">
              <div className="w-40 h-px bg-gradient-to-r from-pink-300 via-pink-300 to-transparent shadow-sm"></div>
            </div>

            {/* Logout */}
            <div className="flex justify-start">
              <button 
                className="relative inline-flex items-center space-x-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:shadow-lg hover:shadow-pink-200/50 hover:border hover:border-pink-300 border border-transparent transition-all duration-300 group py-3 pl-3 pr-4 rounded-2xl animate-in scale-in-95 fade-in duration-400 overflow-hidden"
                style={{ animationDelay: '400ms' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-10 group-hover:animate-in group-hover:slide-in-from-top-2 transition-all duration-300 rounded-2xl"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-pink-300 relative z-10">
                  <LogOut className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 group-hover:translate-x-2 transition-all duration-300 relative z-10">Logout</span>
                <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 ml-2">
                  <ChevronRight className="w-4 h-4 text-pink-500" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Click outside area to close */}
        <div 
          className="absolute inset-0 -z-10" 
          onClick={onClose}
        ></div>
      </div>
    </div>
  );
}