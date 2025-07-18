import { useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  BarChart3,
  Menu,
  X,
  Sparkles,
  Mail,
  User,
  LogOut,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BottomNav } from './BottomNav'

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage?: string
  onNavigate?: (page: string) => void
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Lead Management', href: '/leads', icon: Users },
  { name: 'Gmail Integration', href: '/gmail', icon: Mail },
  { name: 'Email Management', href: '/email', icon: Sparkles },
  { name: 'Kalender', href: '/calendar', icon: Calendar },
  { name: 'Fakturaer', href: '/invoices', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Indstillinger', href: '/settings', icon: Settings },
]

export function DashboardLayout({ children, currentPage = 'Dashboard', onNavigate }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-nordic-bg">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Always visible on desktop */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-nordic-surface border-r border-nordic-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">RenOS v4</h1>
                <p className="text-xs text-muted-foreground">Rendetalje.dk</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = item.name === currentPage
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    if (onNavigate) {
                      if (item.name === 'Dashboard') onNavigate('dashboard')
                      else if (item.name === 'Lead Management') onNavigate('leads')
                      else if (item.name === 'Gmail Integration') onNavigate('gmail')
                      else if (item.name === 'Email Management') onNavigate('email')
                      else if (item.name === 'Kalender') onNavigate('calendar')
                      else if (item.name === 'Fakturaer') onNavigate('invoices')
                      else if (item.name === 'Analytics') onNavigate('analytics')
                      else if (item.name === 'Indstillinger') onNavigate('settings')
                    }
                    setSidebarOpen(false) // Close mobile sidebar after navigation
                  }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              )
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 px-3 py-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Rendetalje Admin</p>
                <p className="text-xs text-muted-foreground truncate">info@rendetalje.dk</p>
              </div>
              <Button variant="ghost" size="sm" className="p-1">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="flex-1 justify-start">
                <User className="w-4 h-4 mr-2" />
                Profil
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 justify-start">
                <LogOut className="w-4 h-4 mr-2" />
                Log ud
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white/95 backdrop-blur-sm border-b border-border px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold text-foreground">{currentPage}</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span>Live System</span>
            </div>
            
            {/* Desktop profile quick access */}
            <div className="hidden lg:flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      
      {/* Bottom Navigation for mobile only */}
      <BottomNav 
        currentPage={currentPage === 'Dashboard' ? 'dashboard' : 
                     currentPage === 'Lead Management' ? 'leads' :
                     currentPage === 'Kalender' ? 'calendar' :
                     currentPage === 'Indstillinger' ? 'settings' : 'dashboard'}
        onNavigate={onNavigate || (() => {})} 
      />
    </div>
  )
}