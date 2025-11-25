import { useState } from "react";
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
import { Shield, AlertTriangle, Mail, KeyRound, ArrowLeft, Lock } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type ForgotPasswordStep = 'email' | 'code' | 'options' | 'newPassword';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showTermsAndDisclaimer, setShowTermsAndDisclaimer] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid email or password",
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
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
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
        title: "Invalid Code",
        description: error.message,
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
        title: "Error",
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

  const handleVerifyOtp = (loginNow: boolean) => {
    if (otpCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter the 6-digit code",
      });
      return;
    }
    verifyOtpMutation.mutate({ email: resetEmail, code: otpCode, loginNow });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 p-4">
      <div className="w-full max-w-md">
        <Card className="rounded-3xl shadow-xl border-0 bg-white/95 animate-in scale-in-95 fade-in duration-200">
          <CardContent className="p-10">
            {/* Logo and Header */}
            <div className="text-center mb-10">
              <div className="w-28 h-20 mx-auto mb-6 flex items-center justify-center animate-in scale-in-95 fade-in duration-300">
                <img 
                  src="/assets/logo.png" 
                  alt="Stronger With Zoe" 
                  className="w-full h-full object-contain drop-shadow-sm"
                  loading="eager"
                  width="112"
                  height="80"
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-3 animate-in slide-in-from-bottom-4 fade-in duration-300">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-lg animate-in slide-in-from-bottom-4 fade-in duration-300">
                Access your fitness programs
              </p>
            </div>

            {/* Login Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
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
                            data-testid="input-email"
                            className="h-12 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-200 bg-white text-gray-800 placeholder:text-gray-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-gray-700 font-medium text-sm">Password</FormLabel>
                          <button
                            type="button"
                            onClick={handleForgotPasswordOpen}
                            className="text-xs text-pink-600 hover:text-pink-700 font-medium transition-colors"
                            data-testid="link-forgot-password"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            data-testid="input-password"
                            className="h-12 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-200 bg-white text-gray-800 placeholder:text-gray-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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

                <div className="animate-in slide-in-from-bottom-4 fade-in duration-300 pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                    disabled={loginMutation.isPending || (showTermsAndDisclaimer && (!termsAccepted || !disclaimerAccepted))}
                    data-testid="button-signin"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign In</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            <div className="mt-8 text-center animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-6 leading-relaxed">
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

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {forgotPasswordStep === 'email' && (
                <>
                  <Mail className="w-5 h-5 text-pink-500" />
                  Forgot Password
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
                  <KeyRound className="w-5 h-5 text-pink-500" />
                  Code Verified!
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
              {forgotPasswordStep === 'email' && "Enter your email and we'll send you a 6-digit code"}
              {forgotPasswordStep === 'code' && "Check your email for the 6-digit code"}
              {forgotPasswordStep === 'options' && "Choose how you'd like to continue"}
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
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                <Button
                  onClick={() => handleVerifyOtp(false)}
                  disabled={verifyOtpMutation.isPending || otpCode.length !== 6}
                  className="w-full h-12 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-semibold rounded-xl"
                  data-testid="button-verify-code"
                >
                  {verifyOtpMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setForgotPasswordStep('email')}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to email
                </button>
              </>
            )}

            {/* Options Step */}
            {forgotPasswordStep === 'options' && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-medium">Your code has been verified!</p>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={() => handleVerifyOtp(true)}
                    disabled={verifyOtpMutation.isPending}
                    className="w-full h-12 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-semibold rounded-xl"
                    data-testid="button-login-now"
                  >
                    {verifyOtpMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Logging in...</span>
                      </div>
                    ) : (
                      "Log In Now"
                    )}
                  </Button>
                  <Button
                    onClick={() => setForgotPasswordStep('newPassword')}
                    variant="outline"
                    className="w-full h-12 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
                    data-testid="button-reset-password"
                  >
                    Reset Password
                  </Button>
                </div>
              </>
            )}

            {/* New Password Step */}
            {forgotPasswordStep === 'newPassword' && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-12 border-2 border-gray-200 rounded-xl focus:border-pink-400"
                      data-testid="input-new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 border-2 border-gray-200 rounded-xl focus:border-pink-400"
                      data-testid="input-confirm-password"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleResetPassword}
                  disabled={resetPasswordMutation.isPending}
                  className="w-full h-12 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-semibold rounded-xl"
                  data-testid="button-save-password"
                >
                  {resetPasswordMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save New Password"
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setForgotPasswordStep('options')}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to options
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
