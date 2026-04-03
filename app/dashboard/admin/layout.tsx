import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Building2, Shield, ArrowLeft } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "super_admin") redirect("/dashboard");

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-sm">Super Admin</span>
                        </div>

                        <nav className="flex items-center gap-1">
                            <Link
                                href="/dashboard/admin"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <Building2 className="w-4 h-4" />
                                Clínicas
                            </Link>
                            <Link
                                href="/dashboard/admin/roles"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <Shield className="w-4 h-4" />
                                Roles
                            </Link>
                        </nav>
                    </div>

                    <Link
                        href="/dashboard"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Volver al dashboard
                    </Link>
                </div>
            </header>
            <main className="flex-1 container py-8">{children}</main>
        </div>
    );
}
