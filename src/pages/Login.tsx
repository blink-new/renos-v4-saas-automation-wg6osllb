import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Sparkles, 
  Mail, 
  ArrowRight,
  Shield,
  Zap,
  Bot,
  Building2,
  Calendar,
  FileText
} from 'lucide-react'
import { blink } from '@/blink/client'

interface LoginProps {
  onLogin: () => void
}

export function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      // Use Blink's built-in authentication
      blink.auth.login()
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Rendetalje Branding */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl flex items-center justify-center shadow-xl">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Rendetalje
            </h1>
            <p className="text-lg font-medium text-gray-700 mt-1">
              RenOS v4
            </p>
            <p className="text-gray-500 text-sm">
              Automatiseret Lead-til-Faktura System
            </p>
          </div>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-2 p-3 bg-white/60 rounded-xl border border-blue-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">AI Email Processing</p>
          </div>
          <div className="space-y-2 p-3 bg-white/60 rounded-xl border border-green-100">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Automatisk Booking</p>
          </div>
          <div className="space-y-2 p-3 bg-white/60 rounded-xl border border-blue-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">SMS Integration</p>
          </div>
          <div className="space-y-2 p-3 bg-white/60 rounded-xl border border-green-100">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Billy Fakturering</p>
          </div>
        </div>

        {/* Login form */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center font-bold text-gray-800">
              Velkommen til RenOS
            </CardTitle>
            <p className="text-sm text-gray-600 text-center">
              Log ind for at administrere dine leads og bookinger
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Google Login Button */}
            <Button 
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm h-12 text-base font-medium"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-3" />
                  Logger ind...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Fortsæt med Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Eller
                </span>
              </div>
            </div>

            {/* Blink Auth Button */}
            <Button 
              onClick={handleGoogleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg h-12 text-base font-medium"
              size="lg"
              disabled={isLoading}
            >
              <Sparkles className="w-5 h-5 mr-3" />
              Log ind med Blink
            </Button>

            {/* Security notice */}
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Sikret med enterprise-grade kryptering</span>
            </div>
          </CardContent>
        </Card>

        {/* Company info */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>info@rendetalje.dk</span>
          </div>
          <p className="text-xs text-gray-500">
            Kun for autoriserede Rendetalje medarbejdere
          </p>
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <Button variant="link" className="text-xs p-0 h-auto text-gray-400 hover:text-gray-600">
              Privatlivspolitik
            </Button>
            <Button variant="link" className="text-xs p-0 h-auto text-gray-400 hover:text-gray-600">
              Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}