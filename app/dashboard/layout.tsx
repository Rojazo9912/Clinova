import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select(`
            role,
            full_name,
            roles (
                permissions
            )
        `)
        .eq('id', user.id)
        .single()

    const rolesData = profile?.roles as any
    const permissions = Array.isArray(rolesData)
        ? rolesData[0]?.permissions
        : rolesData?.permissions || []

    const userName = profile?.full_name || user.email?.split('@')[0] || ''
    const initials = userName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n: string) => n[0]?.toUpperCase())
        .join('')

    return (
        <DashboardShell permissions={permissions} userName={userName} userInitials={initials || 'U'}>
            {children}
        </DashboardShell>
    )
}
