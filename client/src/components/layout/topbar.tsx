import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

interface TopBarProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Dashboard",
    subtitle: "Welcome back, manage your classroom efficiently"
  },
  "/students": {
    title: "Students",
    subtitle: "Manage student profiles and academic records"
  },
  "/courses": {
    title: "Courses",
    subtitle: "Manage course content and enrollment"
  },
  "/attendance": {
    title: "Attendance",
    subtitle: "Track and manage student attendance"
  },
  "/grades": {
    title: "Grades",
    subtitle: "Enter and manage student grades"
  },
  "/reports": {
    title: "Reports",
    subtitle: "Generate and download academic reports"
  },
  "/settings": {
    title: "Settings",
    subtitle: "Configure system preferences"
  }
};

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [location] = useLocation();
  const pageInfo = pageTitles[location] || { title: "EduManager", subtitle: "" };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
            data-testid="button-menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {pageInfo.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" data-testid="button-notifications">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          {/* Search */}
          <div className="hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search students, courses..."
                className="w-64 pl-10"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
