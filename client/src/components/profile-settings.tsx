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
    <div className="fixed inset-0 z-50 bg-gray-50 w-screen h-screen">
      <div className="w-full h-full min-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 w-full">
          <div className="flex items-center justify-between max-w-full">
            <div className="flex items-center space-x-3">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                data-testid="button-close-profile-settings"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-8 w-full">
          <div className="flex items-center space-x-4 max-w-full">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xl font-medium">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white w-full flex-1">
          <div className="space-y-0">
            {/* Notifications */}
            <button className="w-full flex items-center px-6 py-6 hover:bg-gray-50 border-b border-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600 mr-4" />
              <span className="text-lg text-gray-800">Notifications</span>
            </button>

            {/* Community */}
            <button className="w-full flex items-center px-6 py-6 hover:bg-gray-50 border-b border-gray-100 transition-colors">
              <svg className="w-5 h-5 text-gray-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-lg text-gray-800">Community</span>
            </button>

            {/* My Library */}
            <button 
              className="w-full flex items-center px-6 py-6 hover:bg-gray-50 border-b border-gray-100 transition-colors"
              onClick={() => window.location.href = "/my-library"}
            >
              <BookOpen className="w-5 h-5 text-gray-600 mr-4" />
              <span className="text-lg text-gray-800">My Library</span>
            </button>

            {/* Email notifications */}
            <button className="w-full flex items-center px-6 py-6 hover:bg-gray-50 border-b border-gray-100 transition-colors">
              <svg className="w-5 h-5 text-gray-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-lg text-gray-800">Email notifications</span>
            </button>

            {/* Purchases & payments */}
            <button className="w-full flex items-center px-6 py-6 hover:bg-gray-50 border-b border-gray-100 transition-colors">
              <CreditCard className="w-5 h-5 text-gray-600 mr-4" />
              <span className="text-lg text-gray-800">Purchases & payments</span>
            </button>

            {/* Sign out */}
            <button 
              className="w-full flex items-center px-6 py-6 hover:bg-gray-50 transition-colors"
              onClick={handleLogout}
            >
              <svg className="w-5 h-5 text-gray-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-lg text-gray-800">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}