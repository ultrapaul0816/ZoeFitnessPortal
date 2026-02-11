import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";

interface AdminAuthState {
  isLoading: boolean;
  isAdmin: boolean;
  user: User | null;
}

export function useAdminAuth(): AdminAuthState {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    async function checkAdminSession() {
      try {
        const headers: Record<string, string> = {};
        const token = localStorage.getItem("coaching_auth_token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const response = await fetch("/api/auth/session", { credentials: "include", headers });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user?.isAdmin) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          } else if (!hasRedirected) {
            setHasRedirected(true);
            localStorage.removeItem("user");
            setLocation("/admin/login");
          }
        } else if (!hasRedirected) {
          setHasRedirected(true);
          localStorage.removeItem("user");
          setLocation("/admin/login");
        }
      } catch (error) {
        console.error("Admin session check failed:", error);
        if (!hasRedirected) {
          setHasRedirected(true);
          setLocation("/admin/login");
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminSession();
  }, [setLocation, hasRedirected]);

  return {
    isLoading,
    isAdmin: user?.isAdmin ?? false,
    user,
  };
}
