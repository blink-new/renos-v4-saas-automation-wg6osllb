import React from 'react';
import { Home, Users, Calendar, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavTab {
  id: string;
  icon: React.ElementType;
  label: string;
  page: string;
}

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const tabs: NavTab[] = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', page: 'dashboard' },
    { id: 'leads', icon: Users, label: 'Leads', page: 'leads' },
    { id: 'calendar', icon: Calendar, label: 'Kalender', page: 'calendar' },
    { id: 'settings', icon: Settings, label: 'Indstillinger', page: 'settings' }
  ];

  const handleTabClick = (page: string) => {
    onNavigate(page);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-nordic-surface border-t border-nordic-border md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.page;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.page)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full px-2 py-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "text-nordic-accent" 
                  : "text-nordic-muted hover:text-nordic-text"
              )}
            >
              <tab.icon className={cn(
                "w-6 h-6 mb-1 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium",
                isActive && "font-semibold"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};