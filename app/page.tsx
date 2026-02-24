import Link from "next/link";
import { ArrowRight, Activity, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:bg-black/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl md:text-2xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <span>FisioNova</span>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Iniciar Sesión
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-16">
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                v2.0 Disponible
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
                Gestión Inteligente para <span className="text-gradient">Clínicas de Fisioterapia</span>
              </h1>

              <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl leading-relaxed">
                Optimiza tu consulta, gestiona pacientes y automatiza tus procesos con la plataforma más avanzada diseñada por fisioterapeutas para fisioterapeutas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:shadow-blue-500/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Acceder a la Plataforma
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="#"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Solicitar Demo
                </Link>
              </div>
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[1000px] h-[600px] opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="glass-card p-6 rounded-xl space-y-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Rápido y Eficiente</h3>
                <p className="text-muted-foreground">
                  Interfaz optimizada para reducir el tiempo administrativo y dedicar más tiempo a tus pacientes.
                </p>
              </div>
              <div className="glass-card p-6 rounded-xl space-y-3">
                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Seguro y Privado</h3>
                <p className="text-muted-foreground">
                  Cumplimos con los más altos estándares de seguridad y protección de datos médicos.
                </p>
              </div>
              <div className="glass-card p-6 rounded-xl space-y-3">
                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Análisis Clínico</h3>
                <p className="text-muted-foreground">
                  Reportes detallados de evolución y métricas de negocio en tiempo real.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6 mx-auto">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2026 FisioNova. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Términos
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
