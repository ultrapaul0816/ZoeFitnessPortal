import { useLocation, Link } from "wouter";
import { Home, Users, BookOpen, TrendingUp } from "lucide-react";

interface BottomNavProps {
  className?: string;
}

export default function BottomNav({ className = "" }: BottomNavProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/community", label: "Community", icon: Users },
    { path: "/my-courses", label: "Courses", icon: BookOpen },
    { path: "/progress", label: "Progress", icon: TrendingUp },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location === "/" || location === "/dashboard";
    }
    return location.startsWith(path);
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom ${className}`}>
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                  active 
                    ? "text-pink-600" 
                    : "text-gray-500 hover:text-pink-500"
                }`}
              >
                <Icon className={`w-6 h-6 ${active ? "fill-pink-100" : ""}`} />
                <span className={`text-xs mt-1 ${active ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute bottom-0 w-8 h-1 bg-pink-500 rounded-t-full" />
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
