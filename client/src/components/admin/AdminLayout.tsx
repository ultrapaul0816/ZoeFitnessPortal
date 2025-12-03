import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  UserX,
  Dumbbell,
  FolderOpen,
  Image,
  Mail,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Settings,
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  Zap,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  section?: string;
  path?: string;
  badge?: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNavigate: (path: string) => void;
}

const navItems: NavItem[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, section: "Main" },
  { id: "members", label: "Active Members", icon: Users, section: "Members" },
  { id: "deactivated", label: "Deactivated", icon: UserX, section: "Members" },
  { id: "courses", label: "Courses", icon: GraduationCap, section: "Content", path: "/admin/courses", badge: "New" },
  { id: "modules", label: "Module Library", icon: Layers, section: "Content", path: "/admin/modules" },
  { id: "exercises", label: "Exercise Library", icon: Dumbbell, section: "Content", path: "/admin/exercises" },
  { id: "workouts", label: "Workouts", icon: BookOpen, section: "Content" },
  { id: "programs", label: "Programs (Legacy)", icon: FolderOpen, section: "Content" },
  { id: "assets", label: "Assets", icon: Image, section: "Content" },
  { id: "analytics", label: "Analytics", icon: BarChart3, section: "Insights", path: "/admin/analytics" },
  { id: "email-campaigns", label: "Email Campaigns", icon: Mail, section: "Marketing", path: "/admin-email-campaigns" },
  { id: "email-analytics", label: "Email Analytics", icon: BarChart3, section: "Marketing", path: "/admin-email-analytics" },
  { id: "automation", label: "Automation", icon: Zap, section: "Marketing", path: "/admin/automation" },
];

export default function AdminLayout({ children, activeTab, onTabChange, onNavigate }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleNavClick = (item: NavItem) => {
    if (item.path) {
      setLocation(item.path);
    } else {
      onTabChange(item.id);
    }
    setIsMobileOpen(false);
  };

  const groupedItems = navItems.reduce((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const sectionOrder = ["Main", "Members", "Content", "Insights", "Marketing"];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-gray-100 dark:border-gray-800",
        isCollapsed ? "justify-center p-4" : "justify-between px-5 py-5"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200 dark:shadow-pink-900/30">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-base tracking-tight">Admin Panel</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Stronger With Zoe</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="hidden lg:flex h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-6 px-3">
          {sectionOrder.map((section) => {
            const items = groupedItems[section];
            if (!items) return null;
            
            return (
              <div key={section}>
                {!isCollapsed && (
                  <div className="flex items-center gap-2 px-3 mb-3">
                    <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      {section}
                    </p>
                    <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                  </div>
                )}
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    if (isCollapsed) {
                      return (
                        <TooltipProvider key={item.id} delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleNavClick(item)}
                                className={cn(
                                  "w-full flex items-center justify-center p-3 rounded-xl transition-all duration-200 relative",
                                  isActive
                                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/30"
                                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                )}
                                data-testid={`nav-${item.id}`}
                              >
                                <Icon className="w-5 h-5" />
                                {item.badge && (
                                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="font-medium">
                              {item.label}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group",
                          isActive
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/30"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        )}
                        data-testid={`nav-${item.id}`}
                      >
                        <Icon className={cn(
                          "w-5 h-5 transition-transform duration-200",
                          !isActive && "group-hover:scale-110"
                        )} />
                        <span className="text-sm font-medium flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-[10px] px-1.5 py-0 h-5",
                              isActive 
                                ? "bg-white/20 text-white border-white/30" 
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3">
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onNavigate("/dashboard")}
                  className="w-full flex items-center justify-center p-3 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all duration-200"
                  data-testid="nav-exit-admin"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Back to Member View
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <button
            onClick={() => onNavigate("/dashboard")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all duration-200 text-left group"
            data-testid="nav-exit-admin"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-sm font-medium">Back to Member View</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 hidden lg:block shadow-sm",
          isCollapsed ? "w-[72px]" : "w-72"
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white">Admin Panel</span>
              <p className="text-xs text-gray-500">Stronger With Zoe</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="lg:hidden fixed top-16 left-0 right-0 bottom-0 z-50 bg-white dark:bg-gray-950 overflow-auto">
            <SidebarContent />
          </div>
        </>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen pt-16 lg:pt-0 transition-all duration-300",
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-72"
        )}
      >
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
