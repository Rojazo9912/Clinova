import { getClinicById, getClinicUsers, createClinicUser } from "@/lib/actions/admin";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Phone, Mail, UserPlus, Users } from "lucide-react";
import CreateClinicUserForm from "@/components/admin/CreateClinicUserForm";

export const dynamic = "force-dynamic";

export default async function ClinicDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Debug
    console.log('ClinicDetailsPage ID:', id);

    const clinic = await getClinicById(id);
    const users = await getClinicUsers(id);

    if ('error' in clinic) {
        return (
            <div className="space-y-6">
                <div className="bg-destructive/15 text-destructive p-4 rounded-md">
                    Error: {clinic.error}
                </div>
                <Link href="/dashboard/admin" className="text-primary hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Volver
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/admin"
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{clinic.name}</h2>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">{clinic.slug}</span>
                        <span className="text-sm">• ID: {clinic.id}</span>
                    </p>
                </div>
            </div>

            {/* Clinic Info Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 border rounded-xl bg-white shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-slate-500">
                        <MapPin className="w-5 h-5" />
                        <span className="font-medium">Dirección</span>
                    </div>
                    <p className="text-lg font-medium">{clinic.address || "No registrada"}</p>
                </div>

                <div className="p-6 border rounded-xl bg-white shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-slate-500">
                        <Phone className="w-5 h-5" />
                        <span className="font-medium">Teléfono</span>
                    </div>
                    <p className="text-lg font-medium">{clinic.phone || "No registrado"}</p>
                </div>

                <div className="p-6 border rounded-xl bg-white shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-slate-500">
                        <Mail className="w-5 h-5" />
                        <span className="font-medium">Email</span>
                    </div>
                    <p className="text-lg font-medium">{clinic.email || "No registrado"}</p>
                </div>
            </div>

            {/* Users Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Usuarios Administrativos
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            Gerentes y personal administrativo asignado a esta clínica.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* User List */}
                    <div className="lg:col-span-2 space-y-4">
                        {users.length === 0 ? (
                            <div className="p-12 border rounded-xl bg-slate-50 text-center text-slate-500">
                                No hay usuarios asignados a esta clínica aún.
                            </div>
                        ) : (
                            users.map((user: any) => (
                                <div key={user.id} className="p-4 border rounded-xl bg-white flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                            {user.full_name[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium">{user.full_name}</p>
                                            <p className="text-sm text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'clinic_manager'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {user.role === 'clinic_manager' ? 'Gerente' : user.role}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Create User Form Side-panel */}
                    <div className="lg:col-span-1">
                        <div className="border rounded-xl bg-white p-6 sticky top-6">
                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                <UserPlus className="w-4 h-4" />
                                Crear Nuevo Usuario
                            </h4>
                            <CreateClinicUserForm clinicId={clinic.id} createAction={createClinicUser} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
