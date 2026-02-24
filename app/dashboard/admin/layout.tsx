import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // 1. Check Authentication
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 2. Check Role (Super Admin)
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "super_admin") {
        // Redirect unauthorized users to standard dashboard
        redirect("/dashboard");
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between py-4">
                    <div className="flex items-center gap-6">
                        <div className="font-bold text-xl flex items-center gap-2">
                            <span className="text-red-600">🛡️ Super Admin</span>
                        </div>
                        <nav className="flex items-center space-x-4 lg:space-x-6">
                            <a
                                href="/dashboard/admin"
                                className="text-sm font-medium transition-colors hover:text-primary"
                            >
                                Clínicas
                            </a>
                            <a
                                href="/dashboard/admin/roles"
                                className="text-sm font-medium transition-colors hover:text-primary"
                            >
                                Roles
                            </a>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="flex-1 space-y-4 p-8 pt-6">{children}</main>
        </div>
    );
}
