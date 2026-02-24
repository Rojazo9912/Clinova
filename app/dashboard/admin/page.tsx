import { getClinics } from "@/lib/actions/admin";
import Link from "next/link";
import { Plus, Building2, MapPin, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const result = await getClinics();

    // Handle error case
    if ('error' in result) {
        return (
            <div className="space-y-6">
                <div className="bg-destructive/15 text-destructive p-4 rounded-md">
                    Error: {result.error}
                </div>
            </div>
        );
    }

    const clinics = result;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Clínicas</h2>
                    <p className="text-muted-foreground">
                        Administra las clínicas registradas en la plataforma.
                    </p>
                </div>
                <Link
                    href="/dashboard/admin/clinics/new"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Clínica
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {clinics.map((clinic) => (
                    <Link
                        key={clinic.id}
                        href={`/dashboard/admin/clinics/${clinic.id}`}
                        className="block group"
                    >
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                            <div className="flex flex-col space-y-1.5 p-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold leading-none tracking-tight group-hover:text-blue-600 transition-colors">
                                        {clinic.name}
                                    </h3>
                                    <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                                </div>
                                <p className="text-sm text-muted-foreground">/{clinic.slug}</p>
                            </div>
                            <div className="p-6 pt-0 space-y-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    {clinic.address || "Sin dirección"}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Phone className="mr-2 h-4 w-4" />
                                    {clinic.phone || "Sin teléfono"}
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-6 pt-0">
                                <div className="text-xs text-muted-foreground">
                                    ID: {clinic.id}
                                </div>
                                <span className="text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Gestionar Usuarios →
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}

                {clinics.length === 0 && (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No hay clínicas registradas.
                    </div>
                )}
            </div>
        </div>
    );
}
