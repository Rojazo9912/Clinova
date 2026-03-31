'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
    {
        q: "¿Necesito instalar algo para usar AxoMed?",
        a: "No. AxoMed funciona completamente en el navegador web. También puedes instalarlo como app en tu celular (Android o iOS) sin pasar por ninguna tienda de aplicaciones.",
    },
    {
        q: "¿Puedo importar mis pacientes actuales?",
        a: "Sí. Puedes importar tu lista de pacientes desde un archivo Excel o CSV. Nuestro equipo también te ayuda con la migración si vienes de otro sistema.",
    },
    {
        q: "¿Los datos de mis pacientes están seguros?",
        a: "Absolutamente. Usamos encriptación SSL/TLS, backups diarios y nuestros servidores están en México cumpliendo con la LFPDPPP. Nunca vendemos ni compartimos datos de tus pacientes.",
    },
    {
        q: "¿Qué pasa si cancelo mi suscripción?",
        a: "Puedes cancelar en cualquier momento sin penalizaciones. Seguirás teniendo acceso hasta el final del período pagado y podrás exportar todos tus datos antes de salir.",
    },
    {
        q: "¿Cuántos pacientes puedo tener en el plan Básico?",
        a: "El plan Básico incluye hasta 200 pacientes activos. Los planes Profesional y Clínica tienen pacientes ilimitados.",
    },
    {
        q: "¿El portal del paciente tiene costo adicional?",
        a: "No. El portal del paciente está incluido en todos los planes. Tus pacientes pueden agendar citas, ver su expediente y ejercicios asignados sin costo extra.",
    },
    {
        q: "¿Funciona para múltiples sedes?",
        a: "El plan Clínica soporta múltiples sedes con calendarios, equipos y reportes independientes por sede. Contáctanos si necesitas algo personalizado.",
    },
    {
        q: "¿Ofrecen capacitación o soporte?",
        a: "Todos los planes incluyen documentación y soporte por email. El plan Profesional tiene soporte prioritario y el plan Clínica incluye capacitación personalizada en vivo.",
    },
]

export default function FaqAccordion() {
    const [open, setOpen] = useState<number | null>(0)

    return (
        <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
                <div
                    key={i}
                    className="card-solid rounded-2xl overflow-hidden"
                >
                    <button
                        onClick={() => setOpen(open === i ? null : i)}
                        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-muted/50 transition-colors"
                    >
                        <span className="font-semibold text-sm md:text-base">{faq.q}</span>
                        <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            {open === i
                                ? <Minus className="w-3.5 h-3.5" />
                                : <Plus className="w-3.5 h-3.5" />
                            }
                        </span>
                    </button>
                    {open === i && (
                        <div className="px-6 pb-5">
                            <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
