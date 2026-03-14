import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export const metadata = {
    title: 'Términos de Uso | AxoMed',
    description: 'Términos y condiciones de uso de la plataforma AxoMed para clínicas de fisioterapia.',
}

export default function TerminosPage() {
    const lastUpdated = '13 de marzo de 2026'

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6 max-w-4xl">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al inicio
                    </Link>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <FileText className="h-4 w-4 text-blue-600" />
                        Términos de Uso
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
                {/* Title */}
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3">Términos de Uso</h1>
                    <p className="text-muted-foreground text-sm">Última actualización: {lastUpdated}</p>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-10 text-[15px] leading-relaxed">

                    {/* Intro */}
                    <section>
                        <p>
                            Bienvenido a <strong>AxoMed</strong> (en adelante "la Plataforma"), un sistema de gestión clínica
                            desarrollado para clínicas de fisioterapia y profesionales de la salud en México. Al acceder o utilizar
                            la Plataforma, usted acepta quedar vinculado por los presentes Términos de Uso. Si no está de acuerdo
                            con alguno de estos términos, le pedimos no utilizar la Plataforma.
                        </p>
                    </section>

                    {/* 1 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">1. Definiciones</h2>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong className="text-foreground">Plataforma:</strong> El sistema AxoMed, incluyendo su aplicación web, APIs y servicios asociados.</li>
                            <li><strong className="text-foreground">Clínica:</strong> La persona física o moral que contrata el uso de la Plataforma para gestión clínica.</li>
                            <li><strong className="text-foreground">Usuario:</strong> Cualquier fisioterapeuta, recepcionista, administrador u otro personal que acceda a la Plataforma.</li>
                            <li><strong className="text-foreground">Paciente:</strong> La persona cuyos datos e historial clínico son gestionados a través de la Plataforma.</li>
                            <li><strong className="text-foreground">Expediente Clínico:</strong> El conjunto de documentos e información clínica del paciente gestionados conforme a la NOM-004-SSA3-2012.</li>
                        </ul>
                    </section>

                    {/* 2 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">2. Descripción del Servicio</h2>
                        <p className="text-muted-foreground">
                            AxoMed proporciona a clínicas de fisioterapia herramientas para la gestión de pacientes, agenda de citas,
                            expedientes clínicos electrónicos, planes de tratamiento, control de finanzas y comunicación con pacientes.
                            La Plataforma opera como un servicio de software por suscripción (SaaS).
                        </p>
                    </section>

                    {/* 3 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">3. Uso Permitido</h2>
                        <p className="text-muted-foreground mb-3">Al utilizar la Plataforma, usted se compromete a:</p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Utilizar la Plataforma únicamente para fines clínicos legítimos y conforme a la legislación vigente.</li>
                            <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
                            <li>No compartir su cuenta con terceros no autorizados.</li>
                            <li>Obtener el consentimiento informado de sus pacientes antes de registrar sus datos en el sistema.</li>
                            <li>No intentar acceder a datos de otras clínicas o pacientes que no le correspondan.</li>
                            <li>Notificar de inmediato cualquier uso no autorizado de su cuenta.</li>
                        </ul>
                    </section>

                    {/* 4 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">4. Responsabilidades del Usuario</h2>
                        <p className="text-muted-foreground mb-3">
                            Los usuarios de la Plataforma son responsables de:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>La veracidad, exactitud y actualización de la información clínica que ingresan al sistema.</li>
                            <li>Cumplir con las obligaciones profesionales y legales aplicables a su ejercicio clínico.</li>
                            <li>El correcto manejo del expediente clínico electrónico conforme a la NOM-004-SSA3-2012 y NOM-024-SSA3-2010.</li>
                            <li>Garantizar que el uso de la Plataforma cumple con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</li>
                        </ul>
                    </section>

                    {/* 5 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">5. Propiedad Intelectual</h2>
                        <p className="text-muted-foreground">
                            Todos los derechos de propiedad intelectual sobre la Plataforma, incluyendo su software, diseño, logotipos
                            y contenidos propios, pertenecen a AxoMed. Queda prohibida su reproducción, distribución o modificación
                            sin autorización expresa por escrito. Los datos clínicos pertenecen a la Clínica y sus pacientes.
                        </p>
                    </section>

                    {/* 6 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">6. Suscripción y Pagos</h2>
                        <p className="text-muted-foreground">
                            El acceso a la Plataforma está sujeto al pago de una suscripción mensual o anual según el plan contratado.
                            Los precios podrán modificarse con previo aviso de 30 días. El incumplimiento de pago podrá resultar en la
                            suspensión del servicio. No se realizan reembolsos por períodos parciales de uso.
                        </p>
                    </section>

                    {/* 7 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">7. Disponibilidad del Servicio</h2>
                        <p className="text-muted-foreground">
                            AxoMed se compromete a mantener una disponibilidad del servicio del 99% mensual. Sin embargo, no garantiza
                            disponibilidad ininterrumpida. Podrán realizarse mantenimientos programados con notificación previa a los usuarios.
                            AxoMed no será responsable por interrupciones causadas por terceros (proveedores de internet, servicios en la nube, etc.).
                        </p>
                    </section>

                    {/* 8 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">8. Limitación de Responsabilidad</h2>
                        <p className="text-muted-foreground">
                            AxoMed no es responsable de decisiones médicas o clínicas tomadas con base en la información gestionada
                            a través de la Plataforma. La responsabilidad clínica recae exclusivamente en los profesionales de salud
                            que utilizan el sistema. En ningún caso la responsabilidad de AxoMed excederá el monto pagado por la
                            Clínica en los últimos 3 meses de suscripción.
                        </p>
                    </section>

                    {/* 9 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">9. Protección de Datos</h2>
                        <p className="text-muted-foreground">
                            El tratamiento de datos personales se rige por nuestro{' '}
                            <Link href="/privacidad" className="text-blue-600 hover:underline font-medium">
                                Aviso de Privacidad
                            </Link>
                            , conforme a la LFPDPPP y la NOM-024-SSA3-2010 relativa a los Sistemas de Información de Registro
                            Electrónico para la Salud, Intercambio de Información y Continuidad Asistencial.
                        </p>
                    </section>

                    {/* 10 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">10. Terminación</h2>
                        <p className="text-muted-foreground">
                            Cualquiera de las partes podrá dar por terminada la relación dando aviso con 30 días de anticipación.
                            AxoMed podrá suspender el acceso de forma inmediata en caso de incumplimiento grave de estos Términos.
                            Al término del servicio, la Clínica tendrá 30 días para exportar sus datos antes de su eliminación definitiva.
                        </p>
                    </section>

                    {/* 11 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">11. Modificaciones</h2>
                        <p className="text-muted-foreground">
                            AxoMed podrá modificar estos Términos en cualquier momento. Los cambios serán notificados a los usuarios
                            registrados con al menos 15 días de anticipación. El uso continuado de la Plataforma tras la notificación
                            implica la aceptación de los nuevos Términos.
                        </p>
                    </section>

                    {/* 12 */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">12. Legislación Aplicable</h2>
                        <p className="text-muted-foreground">
                            Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia será
                            sometida a la jurisdicción de los tribunales competentes de la Ciudad de México, renunciando las partes
                            a cualquier otro fuero que pudiera corresponderles.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="border-t border-border pt-8">
                        <h2 className="text-xl font-bold text-foreground mb-3">13. Contacto</h2>
                        <p className="text-muted-foreground">
                            Para consultas relacionadas con estos Términos de Uso, puede contactarnos en:{' '}
                            <a href="mailto:legal@axomed.mx" className="text-blue-600 hover:underline font-medium">
                                legal@axomed.mx
                            </a>
                        </p>
                    </section>
                </div>

                {/* Footer nav */}
                <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between text-sm text-muted-foreground">
                    <p>© 2026 AxoMed. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <Link href="/terminos" className="hover:text-foreground transition font-medium text-foreground">Términos de Uso</Link>
                        <Link href="/privacidad" className="hover:text-foreground transition">Aviso de Privacidad</Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
