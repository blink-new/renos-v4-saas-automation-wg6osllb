import { useState, useEffect } from 'react'
import { Dashboard } from './pages/Dashboard'
import { LeadManagement } from './pages/LeadManagement'
import { GmailIntegration } from './pages/GmailIntegration'
import { Settings } from './pages/Settings'
import { CalendarView } from './pages/CalendarView'
import { InvoiceManagement } from './pages/InvoiceManagement'
import { Analytics } from './pages/Analytics'
import { EmailManagement } from './pages/EmailManagement'
import { Login } from './pages/Login'
import { blink } from './blink/client'

type PageType = 'dashboard' | 'leads' | 'gmail' | 'email' | 'calendar' | 'invoices' | 'settings' | 'analytics'
type AppState = 'loading' | 'login' | 'dashboard'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
  const [appState, setAppState] = useState<AppState>('loading')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      console.log('Auth state changed:', state)
      setUser(state.user)
      
      if (state.isLoading) {
        setAppState('loading')
      } else if (!state.user) {
        setAppState('login')
      } else {
        setAppState('dashboard')
      }
    })
    return unsubscribe
  }, [])

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType)
  }

  const handleLogin = () => {
    setAppState('dashboard')
  }

  // Loading state
  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <div className="w-6 h-6 bg-primary-foreground rounded-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">RenOS</h1>
            <p className="text-muted-foreground">Indlæser system...</p>
          </div>
        </div>
      </div>
    )
  }

  // Login state
  if (appState === 'login') {
    return (
      <Login onLogin={handleLogin} />
    )
  }

  // Main app - dashboard state
  const renderPage = () => {
    switch (currentPage) {
      case 'leads':
        return <LeadManagement onNavigate={handleNavigate} />
      case 'gmail':
        return <GmailIntegration onNavigate={handleNavigate} />
      case 'email':
        return <EmailManagement onNavigate={handleNavigate} />
      case 'settings':
        return <Settings onNavigate={handleNavigate} />
      case 'calendar':
        return <CalendarView onNavigate={handleNavigate} />
      case 'invoices':
        return <InvoiceManagement onNavigate={handleNavigate} />
      case 'analytics':
        return <Analytics onNavigate={handleNavigate} />
      default:
        return <Dashboard onNavigate={handleNavigate} />
    }
  }

  return renderPage()
}

export default App