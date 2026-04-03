import { getClinicById, getClinicUsers, createClinicUser } from "@/lib/actions/admin";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, UserPlus, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import CreateClinicUserForm from "@/components/admin/CreateClinicUserForm";
import AdminBillingClient from "@/components/admin/AdminBillingClient";

export const dynamic = "force-dynamic";

export default async function ClinicDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const clinic = await getClinicById(id);
    const users = await getClinicUsers(id);

    if ('error' in clinic) {
        return (
            <div className="space-y-6">
                <div className="bg-destructive/15 text-destructive p-4 rounded-xl">
                    Error: {clinic.error}
                </div>
                <Link href="/dashboard/admin" className="text-primary hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Volver
                </Link>
            </div>
        );
    }

    const isActive = clinic.subscription_status === 'active';
    const hasPlan = clinic.subscription_plan === 'pro' || isActive;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin" className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{clinic.name}</h2>
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">/{clinic.slug}</span>
                        {isActive
                            ? <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3" /> Suscripción activa</span>
                            : hasPlan
                                ? <span className="flex items-center gap-1 text-red-500"><XCircle className="w-3 h-3" /> Suscripción inactiva</span>
                                : <span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" /> Sin suscripción</span>
                        }
                    </p>
                </div>
            </div>

            {/* Billing */}
            <AdminBillingClient
                clinicId={clinic.id}
                isActive={isActive}
                subscriptionId={clinic.stripe_subscription_id ?? null}
                renewalDate={clinic.subscription_current_period_end ?? null}
            />

            {/* Contact Info */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-5 border border-border rounded-xl bg-card shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Dirección</span>
                    </div>
                    <p className="font-medium">{clinic.address || <span className="text-muted-foreground text-sm">No registrada</span>}</p>
                </div>
                <div className="p-5 border border-border rounded-xl bg-card shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Phone className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Teléfono</span>
                    </div>
                    <p className="font-medium">{clinic.phone || <span className="text-muted-foreground text-sm">No registrado</span>}</p>
                </div>
                <div className="p-5 border border-border rounded-xl bg-card shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Email</span>
                    </div>
                    <p className="font-medium">{clinic.email || <span className="text-muted-foreground text-sm">No registrado</span>}</p>
                </div>
            </div>

            {/* Users */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Users className="w-5 h-5" /> Usuarios
                    </h3>
                    <p className="text-muted-foreground text-sm">Personal con acceso a esta clínica.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-3">
                        {users.length === 0 ? (
                            <div className="p-10 border border-border rounded-xl bg-muted/40 text-center text-muted-foreground text-sm">
                                No hay usuarios asignados a esta clínica.
                            </div>
                        ) : (
                            users.map((user: any) => (
                                <div key={user.id} className="p-4 border border-border rounded-xl bg-card flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                            {user.full_name?.[0] ?? '?'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{user.full_name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email ?? user.phone ?? '—'}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        user.role === 'clinic_manager'
                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                            : 'bg-muted text-muted-foreground'
                                    }`}>
                                        {user.role === 'clinic_manager' ? 'Gerente' : user.role}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    <div>
                        <div className="border border-border rounded-xl bg-card p-5 sticky top-6">
                            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                                <UserPlus className="w-4 h-4" /> Crear usuario
                            </h4>
                            <CreateClinicUserForm clinicId={clinic.id} createAction={createClinicUser} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
