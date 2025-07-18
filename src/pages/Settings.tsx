import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings as SettingsIcon,
  User,
  Mail,
  Phone,
  Bot,
  Calendar,
  FileText,
  Bell,
  Shield,
  Zap,
  Save,
  TestTube,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react'

interface SettingsData {
  // Company Settings
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  companyVat: string
  
  // AI Settings
  aiEnabled: boolean
  aiModel: 'gemini' | 'gpt-4'
  autoResponse: boolean
  responseDelay: number
  
  // Email Settings
  emailSignature: string
  emailTemplate: string
  gmailIntegration: boolean
  
  // SMS Settings
  smsEnabled: boolean
  twilioAccountSid: string
  twilioAuthToken: string
  twilioPhoneNumber: string
  
  // Calendar Settings
  googleCalendarIntegration: boolean
  defaultBookingDuration: number
  workingHours: {
    start: string
    end: string
  }
  
  // Invoice Settings
  billyIntegration: boolean
  hourlyRate: number
  vatRate: number
  paymentTerms: number
  
  // Notification Settings
  emailNotifications: boolean
  smsNotifications: boolean
  desktopNotifications: boolean
}

const defaultSettings: SettingsData = {
  companyName: 'Rendetalje ApS',
  companyAddress: 'Rendetalje Vej 123, 2100 København Ø',
  companyPhone: '+45 70 20 30 40',
  companyEmail: 'info@rendetalje.dk',
  companyVat: 'DK12345678',
  
  aiEnabled: true,
  aiModel: 'gemini',
  autoResponse: true,
  responseDelay: 5,
  
  emailSignature: 'Med venlig hilsen,\nRendetalje Team\n\nRendetalje ApS\nTlf: +45 70 20 30 40\nEmail: info@rendetalje.dk',
  emailTemplate: 'Hej {{customerName}},\n\nTak for din henvendelse om {{serviceType}}.\n\nVi har følgende ledige tider:\n1. {{timeSlot1}}\n2. {{timeSlot2}}\n3. {{timeSlot3}}\n\nSvar venligst med tallet for dit ønskede tidspunkt.\n\nEstimeret pris: {{estimatedPrice}} kr\nEstimeret tid: {{estimatedHours}} timer\n\nMed venlig hilsen,\nRendetalje Team',
  gmailIntegration: true,
  
  smsEnabled: true,
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioPhoneNumber: '',
  
  googleCalendarIntegration: true,
  defaultBookingDuration: 3,
  workingHours: {
    start: '08:00',
    end: '17:00'
  },
  
  billyIntegration: true,
  hourlyRate: 349,
  vatRate: 25,
  paymentTerms: 30,
  
  emailNotifications: true,
  smsNotifications: true,
  desktopNotifications: false
}

export function Settings({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [saving, setSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  const testConnection = async (service: string) => {
    setTestingConnection(service)
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000))
    setTestingConnection(null)
  }

  const updateSetting = (key: keyof SettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateNestedSetting = (parent: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof SettingsData] as any),
        [key]: value
      }
    }))
  }

  return (
    <DashboardLayout currentPage="Settings" onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Indstillinger</h1>
            <p className="text-muted-foreground">
              Konfigurer RenOS til dine behov
            </p>
          </div>
          
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <TestTube className="h-4 w-4 mr-2 animate-spin" />
                Gemmer...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Gem Indstillinger
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="company">Firma</TabsTrigger>
            <TabsTrigger value="ai">AI & Automation</TabsTrigger>
            <TabsTrigger value="integrations">Integrationer</TabsTrigger>
            <TabsTrigger value="templates">Skabeloner</TabsTrigger>
            <TabsTrigger value="notifications">Notifikationer</TabsTrigger>
            <TabsTrigger value="advanced">Avanceret</TabsTrigger>
          </TabsList>

          {/* Company Settings */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Firma Oplysninger</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Firma Navn</Label>
                    <Input
                      id="companyName"
                      value={settings.companyName}
                      onChange={(e) => updateSetting('companyName', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyVat">CVR Nummer</Label>
                    <Input
                      id="companyVat"
                      value={settings.companyVat}
                      onChange={(e) => updateSetting('companyVat', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Adresse</Label>
                  <Input
                    id="companyAddress"
                    value={settings.companyAddress}
                    onChange={(e) => updateSetting('companyAddress', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Telefon</Label>
                    <Input
                      id="companyPhone"
                      value={settings.companyPhone}
                      onChange={(e) => updateSetting('companyPhone', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={settings.companyEmail}
                      onChange={(e) => updateSetting('companyEmail', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI & Automation Settings */}
          <TabsContent value="ai">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="h-5 w-5" />
                    <span>AI Indstillinger</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="aiEnabled">AI Email Processing</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatisk analyse og behandling af indkommende emails
                      </p>
                    </div>
                    <Switch
                      id="aiEnabled"
                      checked={settings.aiEnabled}
                      onCheckedChange={(checked) => updateSetting('aiEnabled', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>AI Model</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant={settings.aiModel === 'gemini' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSetting('aiModel', 'gemini')}
                      >
                        Gemini Pro
                      </Button>
                      <Button
                        variant={settings.aiModel === 'gpt-4' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSetting('aiModel', 'gpt-4')}
                      >
                        GPT-4
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoResponse">Automatisk Svar</Label>
                      <p className="text-sm text-muted-foreground">
                        Send automatisk svar til nye leads
                      </p>
                    </div>
                    <Switch
                      id="autoResponse"
                      checked={settings.autoResponse}
                      onCheckedChange={(checked) => updateSetting('autoResponse', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="responseDelay">Svar Forsinkelse (minutter)</Label>
                    <Input
                      id="responseDelay"
                      type="number"
                      value={settings.responseDelay}
                      onChange={(e) => updateSetting('responseDelay', parseInt(e.target.value))}
                      className="w-32"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations">
            <div className="space-y-6">
              {/* Gmail Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <span>Gmail Integration</span>
                    </div>
                    <Badge variant={settings.gmailIntegration ? 'default' : 'secondary'}>
                      {settings.gmailIntegration ? 'Tilsluttet' : 'Ikke tilsluttet'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Gmail OAuth</p>
                      <p className="text-sm text-muted-foreground">
                        Automatisk modtagelse og behandling af emails
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection('gmail')}
                        disabled={testingConnection === 'gmail'}
                      >
                        {testingConnection === 'gmail' ? (
                          <>
                            <TestTube className="h-4 w-4 mr-2 animate-spin" />
                            Tester...
                          </>
                        ) : (
                          'Test Forbindelse'
                        )}
                      </Button>
                      <Button size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Konfigurer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SMS Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5" />
                      <span>SMS Integration (Twilio)</span>
                    </div>
                    <Badge variant={settings.smsEnabled ? 'default' : 'secondary'}>
                      {settings.smsEnabled ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsEnabled">SMS Funktionalitet</Label>
                      <p className="text-sm text-muted-foreground">
                        Send booking muligheder via SMS
                      </p>
                    </div>
                    <Switch
                      id="smsEnabled"
                      checked={settings.smsEnabled}
                      onCheckedChange={(checked) => updateSetting('smsEnabled', checked)}
                    />
                  </div>
                  
                  {settings.smsEnabled && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="space-y-2">
                        <Label htmlFor="twilioAccountSid">Twilio Account SID</Label>
                        <Input
                          id="twilioAccountSid"
                          type="password"
                          value={settings.twilioAccountSid}
                          onChange={(e) => updateSetting('twilioAccountSid', e.target.value)}
                          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="twilioAuthToken">Twilio Auth Token</Label>
                        <Input
                          id="twilioAuthToken"
                          type="password"
                          value={settings.twilioAuthToken}
                          onChange={(e) => updateSetting('twilioAuthToken', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="twilioPhoneNumber">Twilio Telefon Nummer</Label>
                        <Input
                          id="twilioPhoneNumber"
                          value={settings.twilioPhoneNumber}
                          onChange={(e) => updateSetting('twilioPhoneNumber', e.target.value)}
                          placeholder="+45xxxxxxxx"
                        />
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => testConnection('twilio')}
                        disabled={testingConnection === 'twilio'}
                      >
                        {testingConnection === 'twilio' ? (
                          <>
                            <TestTube className="h-4 w-4 mr-2 animate-spin" />
                            Tester SMS...
                          </>
                        ) : (
                          'Test SMS'
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Calendar Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Google Calendar</span>
                    </div>
                    <Badge variant={settings.googleCalendarIntegration ? 'default' : 'secondary'}>
                      {settings.googleCalendarIntegration ? 'Synkroniseret' : 'Ikke synkroniseret'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Automatisk booking</p>
                      <p className="text-sm text-muted-foreground">
                        Opret automatisk kalenderevent ved booking
                      </p>
                    </div>
                    <Button size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Konfigurer
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workingStart">Arbejdstid Start</Label>
                      <Input
                        id="workingStart"
                        type="time"
                        value={settings.workingHours.start}
                        onChange={(e) => updateNestedSetting('workingHours', 'start', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="workingEnd">Arbejdstid Slut</Label>
                      <Input
                        id="workingEnd"
                        type="time"
                        value={settings.workingHours.end}
                        onChange={(e) => updateNestedSetting('workingHours', 'end', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billy Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Billy Fakturering</span>
                    </div>
                    <Badge variant={settings.billyIntegration ? 'default' : 'secondary'}>
                      {settings.billyIntegration ? 'Tilsluttet' : 'Ikke tilsluttet'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Automatisk fakturering</p>
                      <p className="text-sm text-muted-foreground">
                        Opret automatisk fakturaer i Billy
                      </p>
                    </div>
                    <Button size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Konfigurer
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Timepris (DKK)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={settings.hourlyRate}
                        onChange={(e) => updateSetting('hourlyRate', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vatRate">Moms (%)</Label>
                      <Input
                        id="vatRate"
                        type="number"
                        value={settings.vatRate}
                        onChange={(e) => updateSetting('vatRate', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="paymentTerms">Betalingsfrist (dage)</Label>
                      <Input
                        id="paymentTerms"
                        type="number"
                        value={settings.paymentTerms}
                        onChange={(e) => updateSetting('paymentTerms', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Skabelon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailTemplate">Automatisk Svar Skabelon</Label>
                    <Textarea
                      id="emailTemplate"
                      value={settings.emailTemplate}
                      onChange={(e) => updateSetting('emailTemplate', e.target.value)}
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tilgængelige variabler: {{customerName}}, {{serviceType}}, {{timeSlot1}}, {{timeSlot2}}, {{timeSlot3}}, {{estimatedPrice}}, {{estimatedHours}}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emailSignature">Email Signatur</Label>
                    <Textarea
                      id="emailSignature"
                      value={settings.emailSignature}
                      onChange={(e) => updateSetting('emailSignature', e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifikationer</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifikationer</Label>
                    <p className="text-sm text-muted-foreground">
                      Modtag notifikationer via email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">SMS Notifikationer</Label>
                    <p className="text-sm text-muted-foreground">
                      Modtag vigtige notifikationer via SMS
                    </p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="desktopNotifications">Desktop Notifikationer</Label>
                    <p className="text-sm text-muted-foreground">
                      Vis notifikationer i browseren
                    </p>
                  </div>
                  <Switch
                    id="desktopNotifications"
                    checked={settings.desktopNotifications}
                    onCheckedChange={(checked) => updateSetting('desktopNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Avancerede Indstillinger</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm font-medium text-yellow-800">
                        Advarsel: Disse indstillinger kan påvirke systemets funktionalitet
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Alle Integrationer
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Zap className="h-4 w-4 mr-2" />
                      Nulstil Cache
                    </Button>
                    
                    <Button variant="destructive" className="w-full justify-start">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Nulstil Alle Indstillinger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}