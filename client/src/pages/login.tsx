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
import { Shield, AlertTriangle } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      disclaimerAccepted: false,
    },
  });

  // Query to check if user needs disclaimer (only when email is provided)
  const checkDisclaimerQuery = useQuery({
    queryKey: ['/api/users/disclaimer-status', form.watch('email')],
    queryFn: async () => {
      const email = form.watch('email');
      if (!email || !email.includes('@')) return null;
      const response = await apiRequest('GET', `/api/users/disclaimer-status?email=${encodeURIComponent(email)}`);
      return response.json();
    },
    enabled: false, // Only run manually
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("user", JSON.stringify(data.user));
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
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid email or password",
      });
    },
  });

  const onSubmit = async (data: LoginData) => {
    // Check if user exists and needs disclaimer
    if (!showDisclaimer && data.email && data.email.includes('@')) {
      try {
        const response = await apiRequest('GET', `/api/users/disclaimer-status?email=${encodeURIComponent(data.email)}`);
        const result = await response.json();
        if (result.needsDisclaimer) {
          setShowDisclaimer(true);
          return; // Don't submit yet, show disclaimer first
        }
      } catch (error) {
        // If endpoint doesn't exist yet, continue with login
      }
    }
    
    // Submit login with disclaimer acceptance if needed
    const loginData = {
      ...data,
      disclaimerAccepted: showDisclaimer ? disclaimerAccepted : undefined
    };
    
    loginMutation.mutate(loginData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-white p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-rose-200 to-pink-200 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <Card className="rounded-3xl shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-in scale-in-95 fade-in duration-500">
          <CardContent className="p-10">
            {/* Logo and Header */}
            <div className="text-center mb-10">
              <div className="w-28 h-20 mx-auto mb-6 flex items-center justify-center animate-in scale-in-95 fade-in duration-700 delay-200">
                <img 
                  src="/assets/logo.png" 
                  alt="Stronger With Zoe" 
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-lg animate-in slide-in-from-bottom-4 fade-in duration-700 delay-400">
                Access your fitness programs
              </p>
            </div>

            {/* Login Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-500">
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
                            className="h-12 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-800 placeholder:text-gray-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-600">
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
                            className="h-12 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-800 placeholder:text-gray-400"
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
                  <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-600 space-y-4">
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

                <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-700 pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
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

            <div className="mt-8 text-center animate-in slide-in-from-bottom-4 fade-in duration-700 delay-800">
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
