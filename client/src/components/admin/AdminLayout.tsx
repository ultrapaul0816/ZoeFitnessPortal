import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  section?: string;
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
  { id: "workouts", label: "Workouts", icon: Dumbbell, section: "Content" },
  { id: "programs", label: "Programs", icon: FolderOpen, section: "Content" },
  { id: "assets", label: "Assets", icon: Image, section: "Content" },
];

const externalLinks = [
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { id: "email", label: "Email Campaigns", icon: Mail, path: "/admin-email-campaigns" },
];

export default function AdminLayout({ children, activeTab, onTabChange, onNavigate }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleNavClick = (item: NavItem) => {
    onTabChange(item.id);
    setIsMobileOpen(false);
  };

  const handleExternalLink = (path: string) => {
    setLocation(path);
    setIsMobileOpen(false);
  };

  const groupedItems = navItems.reduce((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={cn(
        "flex items-center border-b border-gray-200 dark:border-gray-800",
        isCollapsed ? "justify-center p-4" : "justify-between px-4 py-4"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-sm">Admin Panel</h1>
              <p className="text-xs text-gray-500">Stronger With Zoe</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="hidden lg:flex h-8 w-8 p-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-6 px-3">
          {Object.entries(groupedItems).map(([section, items]) => (
            <div key={section}>
              {!isCollapsed && (
                <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section}
                </p>
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
                                "w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200",
                                isActive
                                  ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
                                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                              )}
                              data-testid={`nav-${item.id}`}
                            >
                              <Icon className="w-5 h-5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
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
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left",
                        isActive
                          ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 font-medium"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      )}
                      data-testid={`nav-${item.id}`}
                    >
                      <Icon className={cn("w-5 h-5", isActive && "text-pink-600")} />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            {!isCollapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Tools
              </p>
            )}
            <div className="space-y-1">
              {externalLinks.map((link) => {
                const Icon = link.icon;
                
                if (isCollapsed) {
                  return (
                    <TooltipProvider key={link.id} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleExternalLink(link.path)}
                            className="w-full flex items-center justify-center p-3 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all duration-200"
                            data-testid={`nav-${link.id}`}
                          >
                            <Icon className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {link.label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }

                return (
                  <button
                    key={link.id}
                    onClick={() => handleExternalLink(link.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all duration-200 text-left"
                    data-testid={`nav-${link.id}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </ScrollArea>

      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onNavigate("/dashboard")}
                  className="w-full flex items-center justify-center p-3 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all duration-200"
                  data-testid="nav-exit-admin"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Back to Member View
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <button
            onClick={() => onNavigate("/dashboard")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all duration-200 text-left"
            data-testid="nav-exit-admin"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Back to Member View</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 hidden lg:block shadow-sm",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        <SidebarContent />
      </div>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">Admin Panel</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="lg:hidden fixed top-14 left-0 right-0 bottom-0 z-50 bg-white dark:bg-gray-950 overflow-auto">
            <SidebarContent />
          </div>
        </>
      )}

      <main
        className={cn(
          "min-h-screen pt-14 lg:pt-0 transition-all duration-300",
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
