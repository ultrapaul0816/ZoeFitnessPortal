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
import { ChevronDown, Info, Globe, Bell, BookOpen, CreditCard, User, LogOut } from "lucide-react";
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
    <div 
      className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-white animate-in slide-in-from-top-4 duration-300" 
      data-testid="page-profile-settings"
    >
      <div className="w-full h-full overflow-y-auto">
        {/* Menu Items */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Profile */}
            <button 
              className="w-full flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                // Handle profile action
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-medium text-gray-900">Profile</span>
            </button>

            {/* My Library */}
            <button 
              className="w-full flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = "/my-library";
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-medium text-gray-900">My Library</span>
            </button>

            {/* Purchases & Payment */}
            <button 
              className="w-full flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                // Handle purchases action
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-medium text-gray-900">Purchases & Payment</span>
            </button>

            {/* Notifications */}
            <button 
              className="w-full flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                // Handle notifications action
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-medium text-gray-900">Notifications</span>
            </button>

            {/* Logout */}
            <button 
              className="w-full flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-medium text-gray-900">Logout</span>
            </button>
          </div>
        </div>

        {/* Click outside area to close */}
        <div 
          className="absolute inset-0 -z-10" 
          onClick={onClose}
        ></div>
      </div>
    </div>
  );
}