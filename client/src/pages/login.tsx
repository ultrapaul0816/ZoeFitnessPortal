import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loginSchema, type LoginData } from "@shared/schema";
import { Shield, AlertTriangle, Loader2, CheckCircle2, XCircle } from "lucide-react";

type LoginState = 'idle' | 'validating' | 'success' | 'error';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>('idle');

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      disclaimerAccepted: false,
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
    onSuccess: (data) => {
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // If user just accepted disclaimer, set flag to show welcome modal on first program access
      if (showDisclaimer && disclaimerAccepted) {
        sessionStorage.setItem("showDisclaimerOnSession", "true");
      }
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your account.",
      });
      if (data.user.isAdmin) {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      // If user exists but needs disclaimer, show disclaimer
      if (error.message.includes('disclaimer') || error.message.includes('Disclaimer')) {
        setShowDisclaimer(true);
        return;
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid email or password",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    // Submit login with disclaimer acceptance if shown
    const loginData = {
      ...data,
      disclaimerAccepted: showDisclaimer ? disclaimerAccepted : undefined
    };
    
    loginMutation.mutate(loginData);
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
                        <FormLabel className="text-gray-700 font-medium text-sm">Password</FormLabel>
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

                {/* Disclaimer Section - Only shown when needed */}
                {showDisclaimer && (
                  <div className="animate-in slide-in-from-bottom-4 fade-in duration-300 space-y-4">
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
                    disabled={loginMutation.isPending || (showDisclaimer && !disclaimerAccepted)}
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

    </div>
  );
}
