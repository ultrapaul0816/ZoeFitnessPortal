import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import ProfileSettings from "@/components/profile-settings";
import BottomNav from "@/components/bottom-nav";
import type { User } from "@shared/schema";

export default function Profile() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-20">
      <ProfileSettings
        isOpen={true}
        onClose={() => navigate("/dashboard")}
        user={user}
        onUserUpdate={(updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }}
      />
      
      <BottomNav />
    </div>
  );
}
