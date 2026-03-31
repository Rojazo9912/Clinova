import Link from "next/link";
import FaqAccordion from "@/components/landing/FaqAccordion";
import {
  ArrowRight, Activity, ShieldCheck, Zap, Calendar, FileText,
  Users, CreditCard, Bell, Dumbbell, CheckCircle, Star,
  BarChart3, Clock, MessageSquare, TrendingUp, ChevronRight,
  Smartphone, Building2, Lock, Server, RefreshCw, Globe,
  Plus, Minus
} from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Calendar, title: "Agenda Inteligente",
    desc: "Drag & drop, bloqueos de horario, citas recurrentes y sincronización con Google Calendar.",
    color: "blue",
  },
  {
    icon: FileText, title: "Expediente Clínico",
    desc: "Notas de sesión, escalas clínicas (EVA, ROM), mapa corporal SVG y evolución del paciente.",
    color: "green",
  },
  {
    icon: Users, title: "Portal del Paciente",
    desc: "Acceso self-service para agendar citas, ver expediente y ejercicios asignados.",
    color: "purple",
  },
  {
    icon: CreditCard, title: "Finanzas y Cobros",
    desc: "Control de pagos, planes de tratamiento y reportes financieros exportables a PDF.",
    color: "amber",
  },
  {
    icon: Bell, title: "Recordatorios Automáticos",
    desc: "Notificaciones por WhatsApp y Email que reducen las cancelaciones hasta un 40%.",
    color: "orange",
  },
  {
    icon: Dumbbell, title: "Ejercicios Terapéuticos",
    desc: "Biblioteca de ejercicios con video e instrucciones. Asigna programas personalizados.",
    color: "cyan",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  cyan: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
};

const steps = [
  { num: "01", icon: Building2, title: "Crea tu clínica", desc: "Regístrate, configura tu clínica y agrega a tu equipo en menos de 5 minutos." },
  { num: "02", icon: Clock, title: "Configura tus servicios", desc: "Define tratamientos, precios y horarios. Personaliza según tu especialidad." },
  { num: "03", icon: TrendingUp, title: "Empieza a crecer", desc: "Agenda citas, registra expedientes y recibe pagos. Todo en un solo lugar." },
];

const testimonials = [
  {
    name: "Dra. Ana González",
    role: "Directora · FisioCenter CDMX",
    text: "AxoMed redujo nuestro tiempo administrativo a la mitad. Ahora dedicamos más tiempo a los pacientes y menos al papeleo.",
    stars: 5,
  },
  {
    name: "Lic. Carlos Mendoza",
    role: "Director · Clínica RehabVida, GDL",
    text: "Los recordatorios automáticos por WhatsApp redujeron nuestras cancelaciones un 38%. El retorno de inversión fue inmediato.",
    stars: 5,
  },
  {
    name: "Dra. María López",
    role: "Especialista en Rehabilitación",
    text: "El expediente clínico con mapa corporal SVG es exactamente lo que necesitaba. Mis notas son mucho más precisas y rápidas.",
    stars: 5,
  },
];

const plans = [
  {
    name: "Básico",
    price: "$599",
    period: "/mes MXN",
    desc: "Para fisioterapeutas independientes",
    highlight: false,
    features: [
      "1 fisioterapeuta",
      "Hasta 200 pacientes",
      "Agenda completa",
      "Expediente clínico",
      "Portal del paciente",
      "Soporte por email",
    ],
  },
  {
    name: "Profesional",
    price: "$1,499",
    period: "/mes MXN",
    desc: "La opción más popular para clínicas",
    highlight: true,
    features: [
      "Hasta 5 fisioterapeutas",
      "Pacientes ilimitados",
      "Todo lo del plan Básico",
      "Notificaciones WhatsApp + Email",
      "Biblioteca de ejercicios",
      "Reportes financieros PDF",
      "Google Calendar sync",
      "Soporte prioritario",
    ],
  },
  {
    name: "Clínica",
    price: "$2,999",
    period: "/mes MXN",
    desc: "Para cadenas y clínicas grandes",
    highlight: false,
    features: [
      "Fisioterapeutas ilimitados",
      "Múltiples sedes",
      "Todo lo del plan Profesional",
      "Roles y permisos avanzados",
      "Capacitación personalizada",
      "Soporte dedicado 24/7",
    ],
  },
];

const includedAll = [
  "14 días de prueba gratis",
  "Sin tarjeta de crédito",
  "Cancela cuando quieras",
  "Datos seguros en México",
];

const integrations = [
  {
    name: "Google Calendar",
    desc: "Sincroniza citas en tiempo real",
    bg: "bg-white dark:bg-slate-800",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="2" fill="#4285F4" />
        <rect x="3" y="4" width="18" height="5" rx="0" fill="#4285F4" />
        <rect x="3" y="4" width="18" height="5" fill="#1A73E8" />
        <path d="M8 2v4M16 2v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="7" y="11" width="4" height="4" rx="0.5" fill="white" opacity="0.9" />
        <rect x="13" y="11" width="4" height="4" rx="0.5" fill="white" opacity="0.6" />
        <rect x="7" y="16" width="4" height="2" rx="0.5" fill="white" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    desc: "Recordatorios automáticos",
    bg: "bg-white dark:bg-slate-800",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#25D366">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.09-1.35A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.1 14.1c-.22.61-1.28 1.18-1.76 1.22-.45.04-.87.2-2.9-.62-2.44-.98-4-3.47-4.12-3.63-.12-.16-.98-1.3-.98-2.48 0-1.18.62-1.76.84-2 .22-.24.48-.3.64-.3l.46.01c.15 0 .35-.06.55.42.22.5.74 1.82.81 1.96.07.14.11.3.02.48-.09.18-.13.3-.26.46-.13.16-.27.35-.39.47-.13.13-.27.27-.12.53.16.26.7 1.15 1.5 1.86.98.87 1.8 1.14 2.06 1.27.26.13.41.11.56-.07.16-.18.66-.77.83-1.03.17-.26.35-.22.59-.13.24.09 1.52.72 1.78.85.26.13.43.2.5.3.07.1.07.57-.15 1.18z" />
      </svg>
    ),
  },
  {
    name: "Stripe",
    desc: "Cobros y suscripciones",
    bg: "bg-white dark:bg-slate-800",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#635BFF">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.11 14.06c-2.04 0-3.42-1.02-3.98-2.54l1.5-.62c.33.88 1.05 1.46 2.5 1.46 1.04 0 1.7-.48 1.7-1.2 0-.66-.52-1.04-1.74-1.36l-.84-.22c-1.74-.44-2.7-1.3-2.7-2.76 0-1.62 1.34-2.74 3.22-2.74 1.76 0 3.02.88 3.5 2.2l-1.46.62c-.3-.76-.9-1.22-2.04-1.22-.94 0-1.58.46-1.58 1.12 0 .6.44.94 1.54 1.22l.86.22c1.9.48 2.9 1.32 2.9 2.9 0 1.7-1.34 2.92-3.38 2.92z" />
      </svg>
    ),
  },
  {
    name: "Resend / Email",
    desc: "Confirmaciones y recordatorios",
    bg: "bg-white dark:bg-slate-800",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="2" fill="#0F172A" />
        <path d="M2 8l10 6 10-6" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "jsPDF",
    desc: "Reportes y expedientes PDF",
    bg: "bg-white dark:bg-slate-800",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="#EF4444" />
        <path d="M14 2v6h6" fill="#FCA5A5" />
        <path d="M8 13h2.5c.83 0 1.5.67 1.5 1.5S11.33 16 10.5 16H9v2H8v-5zm4.5 0H14c.83 0 1.5.67 1.5 1.5v2c0 .83-.67 1.5-1.5 1.5h-1.5v-5zm3.5 0h2v1h-1v1h1v1h-1v2h-1v-5z" fill="white" />
      </svg>
    ),
  },
  {
    name: "Supabase",
    desc: "Base de datos y autenticación",
    bg: "bg-white dark:bg-slate-800",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <path d="M3 15.5L12.97 3l.03 9h8L11.04 24 11 15.5H3z" fill="#3ECF8E" />
      </svg>
    ),
  },
];

const securityItems = [
  { icon: Lock, title: "Encriptación SSL/TLS", desc: "Toda la comunicación entre tu dispositivo y nuestros servidores va cifrada de extremo a extremo." },
  { icon: Server, title: "Datos almacenados en México", desc: "Tu información nunca sale del país. Cumplimos con la Ley Federal de Protección de Datos (LFPDPPP)." },
  { icon: RefreshCw, title: "Backups diarios automáticos", desc: "Realizamos copias de seguridad diarias. Tus datos nunca se pierden, aunque algo salga mal." },
  { icon: ShieldCheck, title: "Autenticación segura", desc: "Sistema de roles y permisos granulares. Cada miembro del equipo accede solo a lo que necesita." },
  { icon: Globe, title: "99.9% de disponibilidad", desc: "Infraestructura en la nube con alta disponibilidad. Tu clínica nunca se queda sin acceso." },
  { icon: Users, title: "Acceso multi-dispositivo", desc: "Desde computadora, tablet o celular. Una sola cuenta para todos tus dispositivos." },
];

const faqs = [
  {
    q: "¿Necesito instalar algo para usar AxoMed?",
    a: "No. AxoMed funciona completamente en el navegador web. También puedes instalarlo como app en tu celular (Android o iOS) sin pasar por ninguna tienda de aplicaciones.",
  },
  {
    q: "¿Puedo importar mis pacientes actuales?",
    a: "Sí. Puedes importar tu lista de pacientes desde un archivo Excel o CSV. Nuestro equipo también te puede ayudar con la migración si tienes datos en otro sistema.",
  },
  {
    q: "¿Los datos de mis pacientes están seguros?",
    a: "Absolutamente. Usamos encriptación SSL/TLS, backups diarios y nuestros servidores están en México cumpliendo con la LFPDPPP. Nosotros nunca vendemos ni compartimos datos.",
  },
  {
    q: "¿Qué pasa si cancelo mi suscripción?",
    a: "Puedes cancelar en cualquier momento sin penalizaciones. Seguirás teniendo acceso hasta el final del período pagado y podrás exportar todos tus datos antes de salir.",
  },
  {
    q: "¿Cuántos pacientes puedo tener en el plan Básico?",
    a: "El plan Básico incluye hasta 200 pacientes activos. El plan Profesional y Clínica tienen pacientes ilimitados.",
  },
  {
    q: "¿El portal del paciente tiene costo adicional?",
    a: "No. El portal del paciente está incluido en todos los planes. Tus pacientes pueden agendar citas, ver su expediente y ejercicios asignados sin costo extra.",
  },
  {
    q: "¿Funciona para múltiples sedes?",
    a: "El plan Clínica soporta múltiples sedes con calendarios, equipos y reportes independientes por sede. Si tienes dudas, contáctanos.",
  },
  {
    q: "¿Ofrecen capacitación o soporte?",
    a: "Todos los planes incluyen documentación y soporte por email. El plan Profesional tiene soporte prioritario y el plan Clínica incluye capacitación personalizada en vivo.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <span>AxoMed</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Funciones</a>
            <a href="#how" className="hover:text-foreground transition-colors">Cómo funciona</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Precios</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex h-9 items-center px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
              Empieza Gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[500px] opacity-25">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 blur-[120px]" />
            </div>
          </div>

          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                v2.0 Disponible — Nuevo portal del paciente
              </div>

              {/* Headline */}
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
                La plataforma de gestión para{" "}
                <span className="text-gradient">clínicas de fisioterapia</span>
              </h1>

              {/* Subheadline */}
              <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
                Agenda, expediente clínico, cobros, portal del paciente y recordatorios automáticos. Todo integrado para que te concentres en lo que importa: tus pacientes.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-2">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-105 hover:shadow-primary/40 transition-all"
                >
                  Comienza Gratis — 14 días
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-8 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Ya tengo cuenta
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                {includedAll.map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Dashboard Preview ── */}
            <div className="mt-16 max-w-5xl mx-auto">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-black/5">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 bg-slate-800 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400/70" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
                    <span className="w-3 h-3 rounded-full bg-green-400/70" />
                  </div>
                  <div className="flex-1 mx-4 bg-slate-700 rounded px-3 py-1 text-xs text-slate-400 text-center">
                    app.axomed.com.mx/dashboard
                  </div>
                </div>

                {/* App UI mock */}
                <div className="bg-slate-900 flex" style={{ height: 320 }}>
                  {/* Sidebar */}
                  <div className="hidden sm:flex flex-col w-44 bg-slate-800/80 p-3 gap-1 shrink-0 border-r border-white/5">
                    <div className="flex items-center gap-2 px-2 py-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white text-sm font-bold">AxoMed</span>
                    </div>
                    {["Dashboard", "Agenda", "Pacientes", "Expediente", "Finanzas"].map((item, i) => (
                      <div
                        key={item}
                        className={`px-3 py-2 rounded-lg text-xs font-medium ${i === 0
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:text-white"
                          }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 p-4 space-y-3 overflow-hidden">
                    <p className="text-slate-400 text-xs font-medium">Buen día, Dr. Rodríguez 👋</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Citas hoy", value: "12", color: "bg-blue-500/15 text-blue-400" },
                        { label: "Pacientes", value: "284", color: "bg-green-500/15 text-green-400" },
                        { label: "Ingresos", value: "$18.4k", color: "bg-purple-500/15 text-purple-400" },
                      ].map((s) => (
                        <div key={s.label} className={`${s.color} rounded-xl p-2.5`}>
                          <p className="text-slate-400 text-[9px] uppercase tracking-wide">{s.label}</p>
                          <p className="font-bold text-sm mt-0.5">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Appointments list */}
                    <div className="bg-slate-800/60 rounded-xl p-3">
                      <p className="text-slate-400 text-[9px] uppercase tracking-wide mb-2">Próximas citas</p>
                      <div className="space-y-1.5">
                        {[
                          { time: "09:00", name: "Juan García", service: "Terapia Manual", color: "bg-green-500" },
                          { time: "10:30", name: "Ana López", service: "Rehabilitación Deportiva", color: "bg-blue-500" },
                          { time: "12:00", name: "Pedro Ruiz", service: "Electroterapia", color: "bg-amber-500" },
                        ].map((apt) => (
                          <div key={apt.name} className="flex items-center gap-2">
                            <span className={`w-1 h-8 ${apt.color} rounded-full shrink-0`} />
                            <span className="text-slate-400 text-[10px] w-8 shrink-0">{apt.time}</span>
                            <div>
                              <p className="text-slate-200 text-[10px] font-medium leading-none">{apt.name}</p>
                              <p className="text-slate-500 text-[9px] mt-0.5">{apt.service}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right mini panel */}
                  <div className="hidden lg:flex flex-col w-48 border-l border-white/5 p-3 gap-3">
                    <p className="text-slate-400 text-[9px] uppercase tracking-wide">Evolución semanal</p>
                    <div className="flex items-end gap-1 h-16">
                      {[40, 65, 55, 80, 70, 90, 75].map((h, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm ${i === 5 ? "bg-blue-500" : "bg-slate-700"}`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="bg-green-500/15 rounded-lg p-2">
                      <p className="text-green-400 text-[9px] font-medium">↑ +12% este mes</p>
                      <p className="text-slate-400 text-[9px]">vs. mes anterior</p>
                    </div>
                    <div className="mt-auto bg-slate-800/60 rounded-lg p-2">
                      <p className="text-slate-400 text-[9px]">Satisfacción</p>
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
        <section className="border-y border-border bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "500+", label: "Clínicas activas" },
                { value: "50K+", label: "Pacientes gestionados" },
                { value: "40%", label: "Menos cancelaciones" },
                { value: "4.9/5", label: "Satisfacción promedio" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl md:text-4xl font-extrabold text-gradient">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INTEGRACIONES ────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-3 mb-10">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">Integraciones</p>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Conectado con las herramientas que ya usas
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                AxoMed se integra con los servicios más populares para que no tengas que cambiar tu forma de trabajar.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {integrations.map((int) => (
                <div
                  key={int.name}
                  className="glass-card dark:bg-slate-800/50 dark:border-white/5 rounded-2xl p-5 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-transform"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    {int.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{int.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{int.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section id="features" className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-14">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">Funcionalidades</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Todo lo que necesitas en un solo lugar
              </h2>
              <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
                Diseñado por fisioterapeutas para fisioterapeutas. Cada función resuelve un problema real de tu clínica.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="glass-card dark:bg-slate-800/50 dark:border-white/5 p-6 rounded-2xl space-y-3 group hover:-translate-y-1 transition-transform">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${colorMap[f.color]}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section id="how" className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-14">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">Proceso</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Empieza en minutos
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line (desktop) */}
              <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.num} className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {step.num.slice(1)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── MOBILE BANNER ────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-background to-purple-500/10 border border-border p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  <Smartphone className="h-3.5 w-3.5" />
                  PWA — Instálala como app nativa
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Funciona en Android e iOS
                </h2>
                <p className="text-muted-foreground text-lg max-w-lg">
                  Instala AxoMed directamente desde tu navegador sin pasar por la App Store. Funciona offline y notificaciones push incluidas.
                </p>
                <ul className="space-y-2">
                  {["Sin descarga de tienda de apps", "Offline disponible", "Notificaciones push", "Actualización automática"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0">
                <div className="w-48 h-80 bg-slate-900 rounded-[2.5rem] border-4 border-slate-700 shadow-2xl overflow-hidden relative">
                  {/* Phone notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-800 rounded-full z-10" />
                  {/* Screen content */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col p-3 pt-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white text-xs font-bold">AxoMed</span>
                    </div>
                    <p className="text-slate-400 text-[9px] mb-2">Agenda del día</p>
                    {["09:00 Juan García", "10:30 Ana López", "12:00 Pedro R.", "15:00 Laura M."].map((apt, i) => (
                      <div key={i} className={`flex items-center gap-1.5 mb-1.5 rounded-lg p-1.5 ${i === 0 ? "bg-blue-600/30" : "bg-slate-700/50"}`}>
                        <span className={`w-1 h-4 rounded-full ${i === 0 ? "bg-blue-400" : "bg-slate-500"}`} />
                        <span className="text-slate-300 text-[9px]">{apt}</span>
                      </div>
                    ))}
                    <div className="mt-auto bg-green-500/20 rounded-lg p-2">
                      <p className="text-green-400 text-[9px] font-medium">4 citas completadas hoy ✓</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SEGURIDAD ────────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-14">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">Seguridad</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Tus datos médicos, protegidos al máximo
              </h2>
              <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
                La información de tus pacientes es sensible. Por eso tomamos la seguridad muy en serio.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4 p-6 glass-card dark:bg-slate-800/50 dark:border-white/5 rounded-2xl">
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compliance banner */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 py-6 px-8 rounded-2xl border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10">
              {[
                "🇲🇽 Datos en México",
                "🔒 SSL/TLS Encriptado",
                "📋 LFPDPPP Cumplimiento",
                "🛡️ Backups Diarios",
                "✅ 99.9% Uptime",
              ].map((badge) => (
                <span key={badge} className="text-sm font-medium text-green-700 dark:text-green-400">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-14">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">Testimonios</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Lo que dicen nuestros clientes
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="glass-card dark:bg-slate-800/50 dark:border-white/5 p-6 rounded-2xl space-y-4">
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────────────── */}
        <section id="pricing" className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-14">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">Precios</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Transparente y sin sorpresas
              </h2>
              <p className="text-muted-foreground text-lg">14 días gratis. Sin tarjeta de crédito.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-6 space-y-6 relative ${plan.highlight
                    ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30 scale-105"
                    : "glass-card dark:bg-slate-800/50 dark:border-white/5"
                    }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1">
                      MÁS POPULAR
                    </div>
                  )}

                  <div>
                    <h3 className={`text-lg font-bold ${plan.highlight ? "" : ""}`}>{plan.name}</h3>
                    <p className={`text-xs mt-0.5 ${plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {plan.desc}
                    </p>
                  </div>

                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className={`text-sm mb-1 ${plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`h-4 w-4 shrink-0 ${plan.highlight ? "text-primary-foreground/80" : "text-green-500"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/register"
                    className={`flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-all ${plan.highlight
                      ? "bg-white text-primary hover:bg-white/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                  >
                    Comenzar gratis
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              ¿Necesitas algo personalizado?{" "}
              <a href="mailto:hola@axomed.com.mx" className="text-primary font-medium hover:underline">
                Contáctanos
              </a>
            </p>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section id="faq" className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-14">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">FAQ</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Preguntas frecuentes
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                ¿Tienes dudas? Aquí resolvemos las más comunes. Si no encuentras tu respuesta,{" "}
                <a href="mailto:hola@axomed.com.mx" className="text-primary hover:underline font-medium">
                  escríbenos
                </a>.
              </p>
            </div>
            <FaqAccordion />
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/40">
          <div className="container mx-auto px-4 md:px-6 text-center space-y-6 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              ¿Listo para transformar tu clínica?
            </h2>
            <p className="text-lg text-muted-foreground">
              Únete a más de 500 clínicas que ya gestionan su consulta con AxoMed. Empieza hoy, sin compromisos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-10 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-105 transition-all"
              >
                Comienza tu prueba gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              14 días gratis · Sin tarjeta · Cancela cuando quieras
            </p>
          </div>
        </section>

      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2 font-bold text-lg">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Activity className="h-4 w-4" />
                </div>
                AxoMed
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Plataforma de gestión clínica para fisioterapeutas. Hecho con ❤️ en México.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Funciones</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Precios</a></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Registro</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Iniciar Sesión</Link></li>
              </ul>
            </div>

            {/* Portal */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Para Pacientes</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/portal/login" className="hover:text-foreground transition-colors">Portal del Paciente</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terminos" className="hover:text-foreground transition-colors">Términos de Uso</Link></li>
                <li><Link href="/privacidad" className="hover:text-foreground transition-colors">Privacidad</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>© 2026 AxoMed. Todos los derechos reservados.</p>
            <p>Hecho con ❤️ para fisioterapeutas de México</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
