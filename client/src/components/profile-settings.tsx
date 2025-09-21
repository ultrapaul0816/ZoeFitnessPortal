import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Info, Globe, Bell, BookOpen, CreditCard } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUserUpdate: (user: UserType) => void;
}

export default function ProfileSettings({ isOpen, onClose, user, onUserUpdate }: ProfileSettingsProps) {
  if (!isOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    onClose();
    window.location.href = "/";
  };

  return (
    <div className="fixed inset-0 z-50 bg-white w-screen h-screen">
      <div className="w-full h-full min-h-screen overflow-y-auto">
        {/* User Profile Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-8 w-full">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-lg font-medium">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        {/* The App Section */}
        <div className="px-6 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 underline">The App</h3>
          
          <div className="space-y-6">
            <button className="block text-lg text-gray-700 hover:text-gray-900 transition-colors">
              Community
            </button>
            
            <button className="block text-lg text-gray-700 hover:text-gray-900 transition-colors">
              Blog
            </button>
            
            <button className="block text-lg text-gray-700 hover:text-gray-900 transition-colors">
              Calendar
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-gray-200"></div>

        {/* Account Section */}
        <div className="px-6 py-6">
          <div className="space-y-6">
            <button 
              className="block text-lg text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => window.location.href = "/my-library"}
            >
              My Library
            </button>
            
            <button className="block text-lg text-gray-700 hover:text-gray-900 transition-colors">
              Email notifications
            </button>
            
            <button className="block text-lg text-gray-700 hover:text-gray-900 transition-colors">
              Purchases & payments
            </button>
            
            <button 
              className="block text-lg text-gray-700 hover:text-gray-900 transition-colors"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}