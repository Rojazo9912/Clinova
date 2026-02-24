import { DashboardSidebar } from '@/components/dashboard/sidebar'
import GlobalSearch from '@/components/search/GlobalSearch'
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
            roles (
                permissions
            )
        `)
        .eq('id', user.id)
        .single()

    // Supabase returns joined data as object for many-to-one, but TS might expect array.
    // We cast to any to avoid strict type checks here for brevity
    const rolesData = profile?.roles as any
    const permissions = Array.isArray(rolesData)
        ? rolesData[0]?.permissions
        : rolesData?.permissions || []

    return (
        <div className="h-full relative bg-slate-50/50">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                <DashboardSidebar permissions={permissions} />
            </div>
            {/* Main Content Area with Dot Pattern */}
            <main className="md:pl-72 h-full min-h-screen bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="p-8 max-w-7xl mx-auto h-full">
                    {children}
                </div>
            </main>
            {/* Global Search Modal */}
            <GlobalSearch />
        </div>
    )
}
