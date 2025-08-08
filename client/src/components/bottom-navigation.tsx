import { useLocation } from "wouter";
import { Home, BarChart3, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
  currentPage: string;
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const [, setLocation] = useLocation();

  const navItems = [
    { id: "home", icon: Home, path: "/" },
    { id: "leaderboard", icon: BarChart3, path: "/leaderboard" },
    { id: "profile", icon: User, path: "/profile" },
    { id: "admin", icon: Settings, path: "/admin" },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-primary">
      <div className="flex justify-around py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 text-white h-auto p-2 ${
                isActive ? "opacity-100" : "opacity-60 hover:opacity-80"
              }`}
              onClick={() => setLocation(item.path)}
            >
              <Icon className="w-6 h-6" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
