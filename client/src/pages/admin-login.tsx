import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loginSchema, type LoginData } from "@shared/schema";
import { Shield, Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft, Wand2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type LoginView = 'credentials' | 'otp-email' | 'otp-code' | 'otp-options' | 'magic-link';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<LoginView>('credentials');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

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
        title: "Authentication Error",
        description: errorMessages[error] || 'Something went wrong. Please try again.',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      return response.json();
    },
    onSuccess: async (data) => {
      if (data.authToken) {
        localStorage.setItem("coaching_auth_token", data.authToken);
        localStorage.setItem("coaching_auth_token_expiry", String(Date.now() + 90 * 24 * 60 * 60 * 1000));
      }
      if (data.user.isAdmin) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({
          title: "Welcome back",
          description: "Redirecting to admin dashboard...",
        });
        setLocation("/admin");
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "This login is for administrators only.",
        });
        try {
          await apiRequest("POST", "/api/auth/logout", {});
        } catch {}
        localStorage.removeItem("user");
      }
    },
    onError: (error: Error) => {
      let message = "Invalid email or password.";
      if (error.message.toLowerCase().includes('not found')) {
        message = "No account found with that email address.";
      } else if (error.message.toLowerCase().includes('password')) {
        message = "Incorrect password. Try the email code option instead.";
      } else if (error.message.toLowerCase().includes('locked') || error.message.toLowerCase().includes('too many')) {
        message = "Too many attempts. Please wait a few minutes or use the email code option.";
      }
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: message,
      });
    },
  });

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
        title: "Code Sent",
        description: "Check your email for the 6-digit verification code.",
      });
      setView('otp-code');
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: error.message.toLowerCase().includes('not found')
          ? "No account found with that email address."
          : error.message,
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
    onSuccess: async (data) => {
      if (data.loggedIn && data.user) {
        if (data.authToken) {
          localStorage.setItem("coaching_auth_token", data.authToken);
        localStorage.setItem("coaching_auth_token_expiry", String(Date.now() + 90 * 24 * 60 * 60 * 1000));
        }
        if (data.user.isAdmin) {
          localStorage.setItem("user", JSON.stringify(data.user));
          toast({
            title: "Welcome back",
            description: "Redirecting to admin dashboard...",
          });
          setView('credentials');
          setLocation("/admin");
        } else {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "This login is for administrators only.",
          });
          try {
            await apiRequest("POST", "/api/auth/logout", {});
          } catch {}
          localStorage.removeItem("user");
          setView('credentials');
        }
      } else {
        setView('otp-options');
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "The code is incorrect or has expired. Please try again.",
      });
    },
  });

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
        title: "Magic Link Sent",
        description: "Check your email and click the link to sign in.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const handleRequestOtp = () => {
    if (!otpEmail) {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter your email address." });
      return;
    }
    requestOtpMutation.mutate(otpEmail);
  };

  const handleVerifyOtp = () => {
    if (otpCode.length !== 6) {
      toast({ variant: "destructive", title: "Invalid Code", description: "Please enter the full 6-digit code." });
      return;
    }
    verifyOtpMutation.mutate({ email: otpEmail, code: otpCode, loginNow: true });
  };

  const handleSendMagicLink = () => {
    if (!magicLinkEmail) {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter your email address." });
      return;
    }
    magicLinkMutation.mutate(magicLinkEmail);
  };

  const resetToCredentials = () => {
    setView('credentials');
    setOtpEmail('');
    setOtpCode('');
    setMagicLinkEmail('');
    setMagicLinkSent(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/assets/logo.png"
            alt="Stronger With Zoe"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-semibold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Secure administration access</p>
        </div>

        <Card className="border-gray-200 bg-white shadow-lg">
          <CardContent className="p-6">
            {view === 'credentials' && (
              <>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input
                                type="email"
                                placeholder="admin@example.com"
                                className="pl-10 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="pl-10 pr-10 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setView('otp-email');
                          setOtpEmail('');
                          setOtpCode('');
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Signing in...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <KeyRound className="h-4 w-4" />
                          Sign In
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-slate-400 uppercase tracking-wider">or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setView('magic-link');
                    setMagicLinkEmail('');
                    setMagicLinkSent(false);
                  }}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Use Magic Link
                </Button>
              </>
            )}

            {view === 'otp-email' && (
              <div className="space-y-4">
                <button
                  onClick={resetToCredentials}
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Email Verification</h3>
                  <p className="text-sm text-slate-500 mt-1">Enter your email to receive a verification code.</p>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleRequestOtp()}
                  />
                </div>
                <Button
                  onClick={handleRequestOtp}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={requestOtpMutation.isPending}
                >
                  {requestOtpMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </div>
                  ) : "Send Verification Code"}
                </Button>
              </div>
            )}

            {view === 'otp-code' && (
              <div className="space-y-4">
                <button
                  onClick={() => setView('otp-email')}
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Enter Verification Code</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    A 6-digit code was sent to <span className="font-medium text-slate-700">{otpEmail}</span>
                  </p>
                </div>
                <div className="flex justify-center py-2">
                  <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  onClick={handleVerifyOtp}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={verifyOtpMutation.isPending || otpCode.length !== 6}
                >
                  {verifyOtpMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Verifying...
                    </div>
                  ) : "Verify & Sign In"}
                </Button>
                <button
                  onClick={() => requestOtpMutation.mutate(otpEmail)}
                  className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  disabled={requestOtpMutation.isPending}
                >
                  Resend code
                </button>
              </div>
            )}

            {view === 'otp-options' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Code Verified</h3>
                  <p className="text-sm text-slate-500 mt-1">Your identity has been confirmed. You can now sign in.</p>
                </div>
                <Button
                  onClick={() => verifyOtpMutation.mutate({ email: otpEmail, code: otpCode, loginNow: true })}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={verifyOtpMutation.isPending}
                >
                  {verifyOtpMutation.isPending ? "Signing in..." : "Sign In Now"}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetToCredentials}
                  className="w-full border-slate-300 text-slate-700"
                >
                  Back to Login
                </Button>
              </div>
            )}

            {view === 'magic-link' && (
              <div className="space-y-4">
                <button
                  onClick={resetToCredentials}
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Magic Link</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {magicLinkSent
                      ? "Check your email and click the link to sign in."
                      : "Enter your email to receive a sign-in link."}
                  </p>
                </div>
                {!magicLinkSent && (
                  <>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        value={magicLinkEmail}
                        onChange={(e) => setMagicLinkEmail(e.target.value)}
                        className="pl-10 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMagicLink()}
                      />
                    </div>
                    <Button
                      onClick={handleSendMagicLink}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                      disabled={magicLinkMutation.isPending}
                    >
                      {magicLinkMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Sending...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Wand2 className="h-4 w-4" />
                          Send Magic Link
                        </div>
                      )}
                    </Button>
                  </>
                )}
                {magicLinkSent && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 mb-3">
                      <Mail className="h-6 w-6 text-indigo-600" />
                    </div>
                    <p className="text-sm text-slate-600">
                      A sign-in link has been sent to <span className="font-medium">{magicLinkEmail}</span>
                    </p>
                    <button
                      onClick={() => {
                        setMagicLinkSent(false);
                        magicLinkMutation.reset();
                      }}
                      className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Send again
                    </button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-gray-400 text-xs mt-6">
          Protected area. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
