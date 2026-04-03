'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, ChevronRight } from 'lucide-react'

type Period = 'mensual' | 'trimestral' | 'anual'

const periods: { key: Period; label: string; price: string; equiv: string | null; billed: string; savings: string | null }[] = [
  {
    key: 'mensual',
    label: 'Mensual',
    price: '$1,500',
    equiv: null,
    billed: 'Cobro mensual',
    savings: null,
  },
  {
    key: 'trimestral',
    label: '3 Meses',
    price: '$1,300',
    equiv: '$3,900 MXN cada 3 meses',
    billed: 'Cobro de $3,900 cada 3 meses',
    savings: 'Ahorra 13%',
  },
  {
    key: 'anual',
    label: 'Anual',
    price: '$1,250',
    equiv: '$15,000 MXN al año',
    billed: 'Cobro de $15,000 al año',
    savings: '2 meses gratis',
  },
]

const features = [
  "Fisioterapeutas ilimitados",
  "Pacientes ilimitados",
  "Agenda completa con citas recurrentes",
  "Expediente clínico y mapa corporal",
  "Portal del paciente (citas, pagos, ejercicios)",
  "Notificaciones WhatsApp + Email",
  "Biblioteca de ejercicios terapéuticos",
  "Reportes financieros PDF",
  "Google Calendar sync",
  "Roles y permisos por usuario",
  "Múltiples sedes",
  "Soporte prioritario",
]

export default function PricingSection() {
  const [period, setPeriod] = useState<Period>('mensual')
  const active = periods.find((p) => p.key === period)!
  const isMonthly = period === 'mensual'

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-10">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Precios</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Todo incluido, sin sorpresas
          </h2>
          <p className="text-muted-foreground text-lg">14 días gratis. Sin tarjeta de crédito.</p>
        </div>

        {/* Period toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p.key
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.label}
                {p.savings && (
                  <span className={`text-xs font-bold ${
                    period === p.key ? 'text-green-600 dark:text-green-400' : 'text-green-600/60 dark:text-green-500/60'
                  }`}>
                    {p.savings}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Single plan card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 shadow-2xl shadow-primary/30 space-y-8">
            <div>
              <h3 className="text-2xl font-extrabold">AxoMed</h3>
              <p className="text-primary-foreground/70 text-sm mt-1">Acceso completo a todas las funciones</p>
            </div>

            <div>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-extrabold">{active.price}</span>
                <span className="text-primary-foreground/70 text-sm mb-1">/mes MXN</span>
              </div>
              {!isMonthly && (
                <p className="text-primary-foreground/60 text-xs mt-1.5">{active.equiv}</p>
              )}
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 shrink-0 text-primary-foreground/80" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="flex h-12 items-center justify-center rounded-xl text-sm font-bold bg-white text-primary hover:bg-white/90 transition-all"
            >
              Comenzar gratis 14 días
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          ¿Necesitas algo personalizado?{' '}
          <a href="mailto:hola@axomed.com.mx" className="text-primary font-medium hover:underline">
            Contáctanos
          </a>
        </p>
      </div>
    </section>
  )
}
