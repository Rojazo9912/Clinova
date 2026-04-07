import {
    Pencil, Ban, UserX, Clock, Receipt, BarChart3,
    LogIn, StickyNote, Bell, CheckCircle2, Circle, Zap
} from "lucide-react";

const phases = [
    {
        id: 1,
        label: "Fase 1",
        title: "Operacional",
        subtitle: "Crítico para el día a día",
        color: "border-red-500",
        headerBg: "bg-red-500",
        badge: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
        status: "next",
        items: [
            {
                icon: Pencil,
                title: "Editar clínica",
                desc: "Modificar nombre, teléfono, email y dirección de una clínica ya creada.",
                priority: "Crítico",
                priorityColor: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
                done: false,
            },
            {
                icon: Ban,
                title: "Suspender acceso",
                desc: "Bloquear el login de toda la clínica cuando no paga, sin eliminarla.",
                priority: "Crítico",
                priorityColor: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
                done: false,
            },
            {
                icon: UserX,
                title: "Desactivar usuario",
                desc: "Deshabilitar un usuario sin eliminarlo (ej. si alguien deja la clínica).",
                priority: "Crítico",
                priorityColor: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
                done: false,
            },
        ],
    },
    {
        id: 2,
        label: "Fase 2",
        title: "Negocio",
        subtitle: "Ingresos y retención",
        color: "border-amber-500",
        headerBg: "bg-amber-500",
        badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
        status: "planned",
        items: [
            {
                icon: Clock,
                title: "Trial management",
                desc: "Activar 14 días de prueba por clínica desde el admin, con contador visible de días restantes.",
                priority: "Alto",
                priorityColor: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
                done: false,
            },
            {
                icon: Receipt,
                title: "Historial de pagos",
                desc: "Ver qué pagó cada clínica, cuándo y qué monto — traído directo de Stripe.",
                priority: "Alto",
                priorityColor: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
                done: false,
            },
            {
                icon: BarChart3,
                title: "Estadísticas por clínica",
                desc: "Cuántos pacientes, citas y fisioterapeutas tiene cada clínica. Ver quién usa el sistema de verdad.",
                priority: "Alto",
                priorityColor: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
                done: false,
            },
        ],
    },
    {
        id: 3,
        label: "Fase 3",
        title: "Soporte",
        subtitle: "Herramientas para atender clientes",
        color: "border-blue-500",
        headerBg: "bg-blue-500",
        badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
        status: "future",
        items: [
            {
                icon: LogIn,
                title: "Impersonar clínica",
                desc: "\"Ver como esta clínica\" para diagnosticar problemas sin pedir credenciales al cliente.",
                priority: "Medio",
                priorityColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                done: false,
            },
            {
                icon: StickyNote,
                title: "Notas internas",
                desc: "Campo de notas por clínica visible solo para super admin. \"Cliente VIP\", \"llamar el martes\".",
                priority: "Medio",
                priorityColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                done: false,
            },
            {
                icon: Bell,
                title: "Notificar a clínica",
                desc: "Enviar email o WhatsApp a una clínica directamente desde el panel de admin.",
                priority: "Medio",
                priorityColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                done: false,
            },
        ],
    },
];

const done = [
    "Listar clínicas con estado de suscripción",
    "Crear clínicas",
    "Ver detalle de clínica con billing integrado",
    "Crear usuarios por clínica",
    "Cambiar contraseña de usuarios",
    "Gestión de roles y permisos",
    "Webhooks de Stripe (pago automático)",
    "Portal de pagos Stripe",
];

const statusLabel: Record<string, string> = {
    next: "Siguiente",
    planned: "Planeado",
    future: "Futuro",
};

const statusColor: Record<string, string> = {
    next: "bg-red-500",
    planned: "bg-amber-500",
    future: "bg-blue-500",
};

export default function RoadmapPage() {
    return (
        <div className="space-y-10 max-w-5xl">
            {/* Header */}
            <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Super Admin</p>
                <h2 className="text-2xl font-bold tracking-tight">Roadmap de mejoras</h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Funcionalidades planificadas ordenadas por impacto en el negocio.
                </p>
            </div>

            {/* Progress bar */}
            <div className="card-solid rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">Progreso general</span>
                    <span className="text-muted-foreground">{done.length} de {done.length + phases.reduce((acc, p) => acc + p.items.length, 0)} funciones</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.round(done.length / (done.length + phases.reduce((acc, p) => acc + p.items.length, 0)) * 100)}%` }}
                    />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> Completado</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Fase 1</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Fase 2</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Fase 3</span>
                </div>
            </div>

            {/* Phases */}
            <div className="grid md:grid-cols-3 gap-6">
                {phases.map((phase) => (
                    <div key={phase.id} className={`rounded-xl border-2 ${phase.color} overflow-hidden`}>
                        {/* Phase header */}
                        <div className={`${phase.headerBg} px-4 py-3 text-white`}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">{phase.label}</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/20`}>
                                    {statusLabel[phase.status]}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg mt-0.5">{phase.title}</h3>
                            <p className="text-xs opacity-80">{phase.subtitle}</p>
                        </div>

                        {/* Items */}
                        <div className="p-4 space-y-3 bg-card">
                            {phase.items.map((item) => (
                                <div key={item.title} className="p-3 rounded-lg border border-border bg-background space-y-2">
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 p-1.5 rounded-md bg-muted">
                                            <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm">{item.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.priorityColor}`}>
                                            {item.priority}
                                        </span>
                                        <Circle className="w-4 h-4 text-muted-foreground/40" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Done */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h3 className="font-bold">Completado</h3>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold px-2 py-0.5 rounded-full">
                        {done.length} funciones
                    </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                    {done.map((item) => (
                        <div key={item} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
