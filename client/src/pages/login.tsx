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
import { Shield, AlertTriangle, Mail, KeyRound, ArrowLeft, Lock, Eye, EyeOff, ShieldCheck, Heart, Sparkles, Wand2 } from "lucide-react";
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
  
  // Magic link state
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Handle error params from magic link redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      const errorMessages: Record<string, string> = {
        'invalid_link': 'The login link is invalid. Please request a new one.',
        'expired_link': 'The login link has expired. Please request a new one.',
        'user_not_found': 'Account not found. Please check your email address.',
        'session_error': 'Something went wrong. Please try again.',
        'verification_failed': 'Login failed. Please try again.',
      };
      toast({
        variant: "destructive",
        title: "Login Issue",
        description: errorMessages[error] || 'Something went wrong. Please try again.',
      });
      // Clear the error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

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

  // Magic link mutation
  const magicLinkMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/auth/magic-link", { email });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send magic link');
      }
      return response.json();
    },
    onSuccess: () => {
      setMagicLinkSent(true);
      toast({
        title: "Magic Link Sent! ✨",
        description: "Check your email and click the link to log in instantly",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Couldn't send magic link",
        description: error.message,
      });
    },
  });

  const handleMagicLinkOpen = () => {
    setShowMagicLink(true);
    setMagicLinkEmail('');
    setMagicLinkSent(false);
  };

  const handleSendMagicLink = () => {
    if (!magicLinkEmail) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address",
      });
      return;
    }
    magicLinkMutation.mutate(magicLinkEmail);
  };

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="rounded-3xl shadow-2xl border-0 bg-white/95">
            <CardContent className="p-8 sm:p-10">
              {/* Logo and Header */}
              <div className="text-center mb-8">
                <div className="w-28 h-20 mx-auto mb-5 flex items-center justify-center">
                  <img 
                    src="/assets/logo.png" 
                    alt="Stronger With Zoe" 
                    className="w-full h-full object-contain drop-shadow-sm"
                    loading="eager"
                    width="112"
                    height="80"
                  />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  {greeting}, mama! 💕
                </h1>
                <p className="text-gray-600 text-base">
                  Your 6-week core recovery journey awaits
                </p>
              </div>

              {/* Rotating Testimonial */}
              <div className="mb-6">
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

              {/* Primary: Magic Link */}
              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={handleMagicLinkOpen}
                  className="w-full h-12 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 group"
                  data-testid="button-login-magic"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Sign In with Magic Link</span>
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  We'll email you a link — just click to sign in, no password needed
                </p>

                <Button
                  type="button"
                  onClick={handleForgotPasswordOpen}
                  variant="outline"
                  className="w-full h-11 border-2 border-pink-200 text-pink-500 hover:bg-pink-50 hover:border-pink-300 font-medium rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center space-x-2 group"
                  data-testid="button-login-otp"
                >
                  <Mail className="w-4 h-4" />
                  <span>Sign In with Email Code</span>
                </Button>
              </div>

              {/* Divider */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-400 font-medium">or use password</span>
                  </div>
                </div>
              </div>

              {/* Secondary: Password Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
                  <div>
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
                              className="h-11 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-200 bg-white text-gray-800 placeholder:text-gray-400 hover:border-gray-300"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
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
                                className="h-11 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-200 bg-white text-gray-800 placeholder:text-gray-400 pr-12 hover:border-gray-300"
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

                  <div className="flex items-center justify-between">
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

                  {showTermsAndDisclaimer && (
                    <div className="space-y-4">
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

                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full h-11 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                    disabled={loginMutation.isPending || (showTermsAndDisclaimer && (!termsAccepted || !disclaimerAccepted))}
                    data-testid="button-signin"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        <span>Signing you in...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Sign In with Password</span>
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-xs">Your data is protected & secure</span>
              </div>

              <div className="mt-4 text-center">
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
      <footer className="py-6 text-center">
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

      {/* Magic Link Dialog */}
      <Dialog open={showMagicLink} onOpenChange={setShowMagicLink}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-500" />
              Magic Link Login
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {!magicLinkSent 
                ? "Enter your email and we'll send you a magic link. Just click it to log in - no password needed!"
                : "Check your email! Click the magic link to log in instantly."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {!magicLinkSent ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-400"
                    data-testid="input-magic-email"
                  />
                </div>
                
                <Button
                  onClick={handleSendMagicLink}
                  disabled={magicLinkMutation.isPending}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl"
                  data-testid="button-send-magic"
                >
                  {magicLinkMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Send Magic Link
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Check Your Email!</h3>
                <p className="text-gray-600 text-sm mb-4">
                  We sent a magic link to <strong>{magicLinkEmail}</strong>
                </p>
                <p className="text-gray-500 text-xs">
                  Click the link in the email to log in. The link expires in 15 minutes.
                </p>
                
                <div className="mt-6 space-y-2">
                  <Button
                    onClick={() => magicLinkMutation.mutate(magicLinkEmail)}
                    variant="outline"
                    disabled={magicLinkMutation.isPending}
                    className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    {magicLinkMutation.isPending ? "Sending..." : "Resend Magic Link"}
                  </Button>
                  <Button
                    onClick={() => setShowMagicLink(false)}
                    variant="ghost"
                    className="w-full text-gray-500"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
