import { getClinics } from "@/lib/actions/admin";
import Link from "next/link";
import { Plus, Building2, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

function StatusBadge({ status, plan }: { status?: string | null; plan?: string | null }) {
    if (status === 'active') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                <CheckCircle className="w-3 h-3" /> Activa
            </span>
        );
    }
    if (plan === 'free' || !status) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                <Clock className="w-3 h-3" /> Sin plan
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            <XCircle className="w-3 h-3" /> Inactiva
        </span>
    );
}

function daysUntil(dateStr?: string | null) {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default async function AdminDashboardPage() {
    const result = await getClinics();

    if ('error' in result) {
        return (
            <div className="bg-destructive/15 text-destructive p-4 rounded-xl">
                Error: {result.error}
            </div>
        );
    }

    const clinics = result;

    const total = clinics.length;
    const active = clinics.filter(c => c.subscription_status === 'active').length;
    const inactive = clinics.filter(c => c.subscription_status === 'inactive').length;
    const noPlan = clinics.filter(c => !c.subscription_status || c.subscription_plan === 'free').length;
    const expiringSoon = clinics.filter(c => {
        const days = daysUntil(c.subscription_current_period_end);
        return days !== null && days <= 7 && days >= 0 && c.subscription_status === 'active';
    }).length;

    const stats = [
        { label: "Total clínicas", value: total, icon: Building2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
        { label: "Con suscripción activa", value: active, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
        { label: "Sin pago / plan free", value: noPlan + inactive, icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
        { label: "Vencen en 7 días", value: expiringSoon, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Clínicas registradas</h2>
                    <p className="text-muted-foreground text-sm">Gestiona pagos, usuarios y acceso de cada clínica.</p>
                </div>
                <Link
                    href="/dashboard/admin/clinics/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Nueva clínica
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.bg} border border-border`}>
                        <div className={`${s.color} mb-2`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-extrabold">{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Clínica</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Próximo cobro</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Registrada</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {clinics.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                                    No hay clínicas registradas.
                                </td>
                            </tr>
                        )}
                        {clinics.map((clinic) => {
                            const days = daysUntil(clinic.subscription_current_period_end);
                            const isExpiringSoon = days !== null && days <= 7 && days >= 0 && clinic.subscription_status === 'active';
                            return (
                                <tr key={clinic.id} className="bg-card hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-semibold">{clinic.name}</p>
                                        <p className="text-xs text-muted-foreground">/{clinic.slug}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={clinic.subscription_status} plan={clinic.subscription_plan} />
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        {clinic.subscription_current_period_end ? (
                                            <span className={isExpiringSoon ? "text-amber-600 font-semibold" : ""}>
                                                {new Date(clinic.subscription_current_period_end).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                {isExpiringSoon && <span className="ml-1 text-xs">(en {days}d)</span>}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                                        {new Date(clinic.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/dashboard/admin/clinics/${clinic.id}`}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                        >
                                            Gestionar →
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
