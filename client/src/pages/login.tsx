import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loginSchema, type LoginData } from "@shared/schema";
import TermsModal from "@/components/terms-modal";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);

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
      return response.json();
    },
    onSuccess: (data) => {
      if (!data.user.termsAccepted) {
        setPendingUser(data.user);
        setShowTermsModal(true);
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
        // Set session flag to show disclaimer on this login session
        sessionStorage.setItem("showDisclaimerOnSession", "true");
        if (data.user.isAdmin) {
          setLocation("/admin");
        } else {
          setLocation("/dashboard");
        }
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

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const handleTermsAccepted = () => {
    if (pendingUser) {
      localStorage.setItem("user", JSON.stringify({ ...pendingUser, termsAccepted: true }));
      // Set session flag to show disclaimer on this login session
      sessionStorage.setItem("showDisclaimerOnSession", "true");
      if (pendingUser.isAdmin) {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    }
    setShowTermsModal(false);
    setPendingUser(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-background p-4">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl shadow-xl border border-border">
          <CardContent className="p-8">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-16 mx-auto mb-4 flex items-center justify-center">
                <img 
                  src="/assets/logo.png" 
                  alt="Stronger With Zoe" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Access your fitness programs</p>
            </div>

            {/* Login Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          data-testid="input-email"
                          {...field}
                        />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          data-testid="input-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="button-signin"
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Need access?{" "}
                <a
                  href="https://strongerwithzoe.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:underline"
                  data-testid="link-purchase"
                >
                  Purchase a program
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showTermsModal && pendingUser && (
        <TermsModal
          userId={pendingUser.id}
          onAccept={handleTermsAccepted}
          onCancel={() => {
            setShowTermsModal(false);
            setPendingUser(null);
          }}
        />
      )}
    </div>
  );
}
