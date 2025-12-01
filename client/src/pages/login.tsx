import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loginSchema, type LoginData } from "@shared/schema";
import { Shield, AlertTriangle, Mail, KeyRound, ArrowLeft, Lock, Eye, EyeOff, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type ForgotPasswordStep = 'email' | 'code' | 'options' | 'newPassword';

// Testimonials for rotation
const testimonials = [
  {
    quote: "This program gave me my confidence back. I feel stronger than ever!",
    author: "Sarah M.",
    role: "Mama of 2"
  },
  {
    quote: "Finally, a program that understands postpartum bodies. Life-changing!",
    author: "Jessica R.",
    role: "6 months postpartum"
  },
  {
    quote: "Zoe's guidance is incredible. My core has never felt this connected.",
    author: "Emma T.",
    role: "First-time mama"
  },
  {
    quote: "The best investment in my postpartum recovery. Thank you, Zoe!",
    author: "Priya K.",
    role: "Mama of 3"
  }
];

// Get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showTermsAndDisclaimer, setShowTermsAndDisclaimer] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [greeting, setGreeting] = useState(getGreeting());
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Rotate testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update greeting periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      termsAccepted: false,
      disclaimerAccepted: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const profileDataStr = localStorage.getItem('profileData');
      const requestData = profileDataStr ? { ...data, profileData: JSON.parse(profileDataStr) } : data;
      
      const response = await apiRequest("POST", "/api/auth/login", requestData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("user", JSON.stringify(data.user));
      
      if (showTermsAndDisclaimer && (termsAccepted || disclaimerAccepted)) {
        sessionStorage.setItem("showDisclaimerOnSession", "true");
      }
      
      toast({
        title: `Welcome back, ${data.user.firstName}! 💪`,
        description: "Let's get stronger together, mama!",
      });
      if (data.user.isAdmin) {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      if (error.message.includes('terms') || error.message.includes('Terms') || 
          error.message.includes('disclaimer') || error.message.includes('Disclaimer')) {
        setShowTermsAndDisclaimer(true);
        return;
      }
      
      // Friendly error messages
      let friendlyMessage = "Invalid email or password";
      if (error.message.toLowerCase().includes('not found')) {
        friendlyMessage = "We couldn't find an account with that email. Please check and try again.";
      } else if (error.message.toLowerCase().includes('password')) {
        friendlyMessage = "That password doesn't match. Need help? Try the email code option below.";
      } else if (error.message.toLowerCase().includes('locked') || error.message.toLowerCase().includes('too many')) {
        friendlyMessage = "Too many attempts. Please wait a few minutes or use the email code option.";
      }
      
      toast({
        variant: "destructive",
        title: "Oops!",
        description: friendlyMessage,
      });
    },
  });

  // Forgot password mutations
  const requestOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/auth/forgot-password", { email });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send code');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Code Sent! 📧",
        description: "Check your email for the 6-digit code",
      });
      setForgotPasswordStep('code');
    },
    onError: (error: Error) => {
      let friendlyMessage = error.message;
      if (error.message.toLowerCase().includes('not found')) {
        friendlyMessage = "We couldn't find an account with that email. Please check the spelling.";
      }
      toast({
        variant: "destructive",
        title: "Hmm, something's not right",
        description: friendlyMessage,
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, code, loginNow }: { email: string; code: string; loginNow: boolean }) => {
      const response = await apiRequest("POST", "/api/auth/verify-otp", { email, code, loginNow });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid code');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.loggedIn && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({
          title: `Welcome back, ${data.user.firstName}! 💪`,
          description: "You're now logged in",
        });
        setShowForgotPassword(false);
        if (data.user.isAdmin) {
          setLocation("/admin");
        } else {
          setLocation("/dashboard");
        }
      } else {
        setForgotPasswordStep('options');
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "That code didn't work",
        description: "Please check the code and try again, or request a new one.",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ email, code, newPassword }: { email: string; code: string; newPassword: string }) => {
      const response = await apiRequest("POST", "/api/auth/reset-password", { email, code, newPassword });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({
          title: "Password Reset! 🎉",
          description: "Your password has been updated and you're now logged in",
        });
        setShowForgotPassword(false);
        if (data.user.isAdmin) {
          setLocation("/admin");
        } else {
          setLocation("/dashboard");
        }
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Couldn't reset password",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    const loginData = {
      ...data,
      termsAccepted: showTermsAndDisclaimer ? termsAccepted : undefined,
      disclaimerAccepted: showTermsAndDisclaimer ? disclaimerAccepted : undefined
    };
    
    loginMutation.mutate(loginData);
  };

  const handleForgotPasswordOpen = () => {
    setShowForgotPassword(true);
    setForgotPasswordStep('email');
    setResetEmail('');
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleRequestOtp = () => {
    if (!resetEmail) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address",
      });
      return;
    }
    requestOtpMutation.mutate(resetEmail);
  };

  const handleProceedToOptions = () => {
    if (otpCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter the 6-digit code",
      });
      return;
    }
    setForgotPasswordStep('options');
  };

  const handleLoginWithOtp = () => {
    if (otpCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter the 6-digit code",
      });
      return;
    }
    verifyOtpMutation.mutate({ email: resetEmail, code: otpCode, loginNow: true });
  };

  const handleResetPassword = () => {
    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 8 characters",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match",
      });
      return;
    }
    resetPasswordMutation.mutate({ email: resetEmail, code: otpCode, newPassword });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 relative overflow-hidden">
      {/* Decorative floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-fuchsia-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-56 h-56 bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-40 h-40 bg-gradient-to-br from-pink-200/20 to-fuchsia-200/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4.5s', animationDelay: '0.5s' }}></div>
        {/* Subtle sparkle dots */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-pink-400/40 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-rose-400/40 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-fuchsia-400/40 rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '2s' }}></div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          <Card className="rounded-3xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-in zoom-in-95 fade-in duration-500">
            <CardContent className="p-8 sm:p-10">
              {/* Logo and Header */}
              <div className="text-center mb-8">
                <div className="w-28 h-20 mx-auto mb-5 flex items-center justify-center animate-in zoom-in-95 fade-in duration-500">
                  <img 
                    src="/assets/logo.png" 
                    alt="Stronger With Zoe" 
                    className="w-full h-full object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300"
                    loading="eager"
                    width="112"
                    height="80"
                  />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: '100ms' }}>
                  {greeting}, mama! 💕
                </h1>
                <p className="text-gray-600 text-base animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: '150ms' }}>
                  Your 6-week core recovery journey awaits
                </p>
              </div>

              {/* Rotating Testimonial */}
              <div className="mb-6 animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: '200ms' }}>
                <div className="bg-gradient-to-r from-pink-50/80 to-rose-50/80 border border-pink-100 rounded-xl p-4 relative overflow-hidden">
                  <div className="absolute top-2 left-3 text-pink-300 text-2xl">"</div>
                  <div className="transition-all duration-500 ease-in-out">
                    <p className="text-gray-700 text-sm italic pl-4 pr-2 leading-relaxed">
                      {testimonials[currentTestimonial].quote}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-2 pr-2">
                      <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                      <span className="text-xs text-gray-500 font-medium">
                        {testimonials[currentTestimonial].author}, {testimonials[currentTestimonial].role}
                      </span>
                    </div>
                  </div>
                  {/* Testimonial dots */}
                  <div className="flex justify-center gap-1.5 mt-3">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          index === currentTestimonial ? 'bg-pink-500 w-3' : 'bg-pink-200 hover:bg-pink-300'
                        }`}
                        aria-label={`View testimonial ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Login Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: '250ms' }}>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium text-sm">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              autoComplete="email"
                              data-testid="input-email"
                              className="h-12 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-200 bg-white text-gray-800 placeholder:text-gray-400 hover:border-gray-300"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: '300ms' }}>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium text-sm">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                data-testid="input-password"
                                className="h-12 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-200 bg-white text-gray-800 placeholder:text-gray-400 pr-12 hover:border-gray-300"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                data-testid="button-toggle-password"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                              >
                                {showPassword ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: '350ms' }}>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(!!checked)}
                        className="border-gray-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                        data-testid="checkbox-remember-me"
                      />
                      <label 
                        htmlFor="remember-me" 
                        className="text-sm text-gray-600 cursor-pointer select-none hover:text-gray-800 transition-colors"
                      >
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleForgotPasswordOpen}
                      className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors hover:underline decoration-pink-300 underline-offset-2"
                      data-testid="link-forgot-password"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Terms and Disclaimer Section - Only shown when needed */}
                  {showTermsAndDisclaimer && (
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-300 space-y-4">
                      {/* Terms Content */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <AlertTriangle className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-800 mb-2">Terms & Conditions</h3>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              By accessing this program, you agree to our terms of service. This includes proper use of the platform, respecting intellectual property, and understanding that results may vary. You are responsible for your own health and safety while using this program.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Terms Checkbox */}
                      <div className="flex items-start space-x-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex-shrink-0 mt-1">
                          <Checkbox 
                            id="terms-acceptance"
                            checked={termsAccepted}
                            onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                            data-testid="checkbox-terms-acceptance"
                            className="w-4 h-4 border-2 border-blue-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-indigo-500 data-[state=checked]:border-blue-500"
                          />
                        </div>
                        <label 
                          htmlFor="terms-acceptance" 
                          className="text-xs font-medium leading-relaxed cursor-pointer text-gray-800"
                        >
                          <strong className="text-blue-600">I accept the terms and conditions.</strong> I understand and agree to the terms of service outlined above.
                        </label>
                      </div>

                      {/* Disclaimer Content */}
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <Shield className="w-5 h-5 text-pink-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-800 mb-2">Health Disclaimer</h3>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              This program provides general fitness information for postpartum women. Always consult your healthcare provider before beginning any exercise program. By proceeding, you confirm you have medical clearance and understand the risks involved.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Disclaimer Checkbox */}
                      <div className="flex items-start space-x-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex-shrink-0 mt-1">
                          <Checkbox 
                            id="disclaimer-acceptance"
                            checked={disclaimerAccepted}
                            onCheckedChange={(checked) => setDisclaimerAccepted(!!checked)}
                            data-testid="checkbox-disclaimer-acceptance"
                            className="w-4 h-4 border-2 border-pink-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-rose-500 data-[state=checked]:border-pink-500"
                          />
                        </div>
                        <label 
                          htmlFor="disclaimer-acceptance" 
                          className="text-xs font-medium leading-relaxed cursor-pointer text-gray-800"
                        >
                          <strong className="text-pink-600">I acknowledge that I have read and understand the disclaimer above.</strong> I confirm that I have received medical clearance from my healthcare provider to begin exercising and understand the risks involved.
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="animate-in slide-in-from-bottom-3 fade-in duration-500 pt-1" style={{ animationDelay: '400ms' }}>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 group"
                      disabled={loginMutation.isPending || (showTermsAndDisclaimer && (!termsAccepted || !disclaimerAccepted))}
                      data-testid="button-signin"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Signing you in...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span>Sign In with Password</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>

              {/* Divider */}
              <div className="mt-5 animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: '450ms' }}>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-400 font-medium">or</span>
                  </div>
                </div>
              </div>

              {/* Login with OTP Button - Equal prominence */}
              <div className="mt-5 animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: '500ms' }}>
                <Button
                  type="button"
                  onClick={handleForgotPasswordOpen}
                  variant="outline"
                  className="w-full h-12 border-2 border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 group"
                  data-testid="button-login-otp"
                >
                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Sign In with Email Code</span>
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  We'll send a 6-digit code to your email
                </p>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: '550ms' }}>
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-xs">Your data is protected & secure</span>
              </div>

              <div className="mt-4 text-center animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: '600ms' }}>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Need access?{" "}
                  <a
                    href="https://strongerwithzoe.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 font-semibold hover:text-pink-700 transition-colors duration-200 hover:underline decoration-pink-300 underline-offset-2"
                    data-testid="link-purchase"
                  >
                    Purchase a program
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="relative z-10 py-6 text-center animate-in slide-in-from-bottom-3 fade-in duration-500" style={{ animationDelay: '700ms' }}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-gray-500">
          <span>© 2024 Stronger With Zoe. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a 
              href="https://strongerwithzoe.in/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-pink-600 transition-colors"
            >
              Privacy Policy
            </a>
            <span className="text-gray-300">|</span>
            <a 
              href="https://strongerwithzoe.in/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-pink-600 transition-colors"
            >
              Terms of Service
            </a>
            <span className="text-gray-300">|</span>
            <a 
              href="mailto:support@strongerwithzoe.in"
              className="hover:text-pink-600 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </footer>

      {/* Login with OTP Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {forgotPasswordStep === 'email' && (
                <>
                  <Mail className="w-5 h-5 text-pink-500" />
                  Login with OTP
                </>
              )}
              {forgotPasswordStep === 'code' && (
                <>
                  <KeyRound className="w-5 h-5 text-pink-500" />
                  Enter Code
                </>
              )}
              {forgotPasswordStep === 'options' && (
                <>
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  Almost there!
                </>
              )}
              {forgotPasswordStep === 'newPassword' && (
                <>
                  <Lock className="w-5 h-5 text-pink-500" />
                  Set New Password
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {forgotPasswordStep === 'email' && "Enter your email and we'll send you a 6-digit code to log in"}
              {forgotPasswordStep === 'code' && "Enter the 6-digit code sent to your email"}
              {forgotPasswordStep === 'options' && "You can log in now or set a new password"}
              {forgotPasswordStep === 'newPassword' && "Create a new password for your account"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Email Step */}
            {forgotPasswordStep === 'email' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-pink-400"
                    data-testid="input-reset-email"
                  />
                </div>
                <Button
                  onClick={handleRequestOtp}
                  disabled={requestOtpMutation.isPending}
                  className="w-full h-12 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-semibold rounded-xl"
                  data-testid="button-send-code"
                >
                  {requestOtpMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send Code"
                  )}
                </Button>
              </>
            )}

            {/* Code Entry Step */}
            {forgotPasswordStep === 'code' && (
              <>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 block text-center">Enter the 6-digit code</label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otpCode}
                      onChange={(value) => setOtpCode(value)}
                      data-testid="input-otp"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="w-12 h-14 text-xl border-2 rounded-lg" />
                        <InputOTPSlot index={1} className="w-12 h-14 text-xl border-2 rounded-lg" />
                        <InputOTPSlot index={2} className="w-12 h-14 text-xl border-2 rounded-lg" />
                        <InputOTPSlot index={3} className="w-12 h-14 text-xl border-2 rounded-lg" />
                        <InputOTPSlot index={4} className="w-12 h-14 text-xl border-2 rounded-lg" />
                        <InputOTPSlot index={5} className="w-12 h-14 text-xl border-2 rounded-lg" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-gray-500 text-center">Code expires in 10 minutes</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setForgotPasswordStep('email')}
                    className="flex-1 h-12 rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleProceedToOptions}
                    disabled={otpCode.length !== 6}
                    className="flex-1 h-12 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-semibold rounded-xl"
                    data-testid="button-verify-code"
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}

            {/* Options Step */}
            {forgotPasswordStep === 'options' && (
              <>
                <div className="space-y-3">
                  <Button
                    onClick={handleLoginWithOtp}
                    disabled={verifyOtpMutation.isPending}
                    className="w-full h-12 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-semibold rounded-xl"
                    data-testid="button-login-now"
                  >
                    {verifyOtpMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Logging in...</span>
                      </div>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Log In Now
                      </>
                    )}
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">or</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setForgotPasswordStep('newPassword')}
                    className="w-full h-12 rounded-xl border-2"
                    data-testid="button-reset-password-option"
                  >
                    <KeyRound className="w-4 h-4 mr-2" />
                    Set a New Password
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setForgotPasswordStep('code')}
                  className="w-full text-gray-500"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to code entry
                </Button>
              </>
            )}

            {/* New Password Step */}
            {forgotPasswordStep === 'newPassword' && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-12 border-2 border-gray-200 rounded-xl focus:border-pink-400 pr-12"
                        data-testid="input-new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 border-2 border-gray-200 rounded-xl focus:border-pink-400"
                      data-testid="input-confirm-password"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setForgotPasswordStep('options')}
                    className="flex-1 h-12 rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleResetPassword}
                    disabled={resetPasswordMutation.isPending}
                    className="flex-1 h-12 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-semibold rounded-xl"
                    data-testid="button-set-password"
                  >
                    {resetPasswordMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Setting...</span>
                      </div>
                    ) : (
                      "Set Password"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
