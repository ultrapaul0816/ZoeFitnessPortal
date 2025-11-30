import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      // First check localStorage for quick initial render
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Then verify with server session
      const response = await fetch("/api/auth/session", { credentials: "include" });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        // Session invalid or expired - clear localStorage
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Session check failed:", error);
      // On error, keep user from localStorage but don't redirect
    } finally {
      setLoading(false);
    }
  }

  return { user, loading, refreshSession: checkSession };
}
