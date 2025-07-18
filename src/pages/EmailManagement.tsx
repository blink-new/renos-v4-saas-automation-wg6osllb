import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { EmailCommunication } from '@/components/dashboard/EmailCommunication'

export function EmailManagement({ onNavigate }: { onNavigate?: (page: string) => void }) {
  return (
    <DashboardLayout currentPage="Email Management" onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Management</h1>
          <p className="text-muted-foreground">
            Send automatiske emails til kunder og administrer email kommunikation
          </p>
        </div>

        {/* Email Communication Component */}
        <EmailCommunication />
      </div>
    </DashboardLayout>
  )
}