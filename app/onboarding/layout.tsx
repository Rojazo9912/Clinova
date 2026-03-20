import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // Ensure user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Check if user already has a clinic assigned, if so, they don't need onboarding
    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (profile?.clinic_id) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4">
            <header className="absolute top-0 w-full p-6 flex justify-center border-b border-border bg-card/50 backdrop-blur-md">
                <div className="text-2xl font-bold tracking-tighter text-blue-600 dark:text-blue-400">AxoMed</div>
            </header>
            
            <main className="w-full max-w-lg mt-16">
                {children}
            </main>
        </div>
    )
}
