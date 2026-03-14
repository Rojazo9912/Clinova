import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export const metadata = {
    title: 'Aviso de Privacidad | AxoMed',
    description: 'Aviso de privacidad de AxoMed conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.',
}

export default function PrivacidadPage() {
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
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        Aviso de Privacidad
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
                {/* Title */}
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3">Aviso de Privacidad</h1>
                    <p className="text-muted-foreground text-sm">Última actualización: {lastUpdated}</p>
                </div>

                {/* NOM badge */}
                <div className="mb-10 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
                        Este aviso cumple con la <strong>Ley Federal de Protección de Datos Personales en Posesión de los
                        Particulares (LFPDPPP)</strong>, su Reglamento, y con la{' '}
                        <strong>NOM-024-SSA3-2010</strong> relativa a los Sistemas de Información de Registro Electrónico
                        para la Salud.
                    </p>
                </div>

                <div className="space-y-10 text-[15px] leading-relaxed">

                    {/* Identidad del responsable */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">1. Identidad y Domicilio del Responsable</h2>
                        <p className="text-muted-foreground">
                            <strong className="text-foreground">AxoMed</strong> (en adelante "el Responsable") es responsable
                            del tratamiento de sus datos personales. Para cualquier asunto relacionado con este Aviso de Privacidad,
                            puede contactarnos en:
                        </p>
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border text-muted-foreground text-sm space-y-1">
                            <p><strong className="text-foreground">Correo electrónico:</strong>{' '}
                                <a href="mailto:privacidad@axomed.mx" className="text-blue-600 hover:underline">privacidad@axomed.mx</a>
                            </p>
                            <p><strong className="text-foreground">País:</strong> México</p>
                        </div>
                    </section>

                    {/* Datos que recabamos */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">2. Datos Personales que Recabamos</h2>
                        <p className="text-muted-foreground mb-4">Recabamos las siguientes categorías de datos personales:</p>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">2.1 Datos de Usuarios (fisioterapeutas y personal clínico):</h3>
                                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                                    <li>Nombre completo, correo electrónico, teléfono</li>
                                    <li>Cédula profesional y especialidad</li>
                                    <li>Credenciales de acceso (contraseña cifrada)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">2.2 Datos de Pacientes (datos personales sensibles):</h3>
                                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                                    <li>Nombre, fecha de nacimiento, sexo, correo y teléfono</li>
                                    <li>Historial clínico, diagnósticos, tratamientos y notas de sesión</li>
                                    <li>Mediciones clínicas (dolor, movilidad, fuerza)</li>
                                    <li>Planes de tratamiento y objetivos terapéuticos</li>
                                    <li>Información de pago relacionada con servicios clínicos</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                <strong>Datos sensibles:</strong> Los datos de salud son considerados datos personales sensibles
                                conforme al artículo 3, fracción VI de la LFPDPPP. Su tratamiento se realiza con las medidas de
                                seguridad reforzadas que establece la Ley.
                            </p>
                        </div>
                    </section>

                    {/* Finalidades */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">3. Finalidades del Tratamiento</h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">3.1 Finalidades primarias (necesarias para el servicio):</h3>
                                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                                    <li>Gestión del expediente clínico electrónico del paciente</li>
                                    <li>Programación y seguimiento de citas y sesiones</li>
                                    <li>Elaboración de planes de tratamiento</li>
                                    <li>Registro de evolución clínica y métricas de progreso</li>
                                    <li>Facturación y gestión de pagos por servicios clínicos</li>
                                    <li>Envío de recordatorios de citas al paciente</li>
                                    <li>Acceso del paciente a su portal personal</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">3.2 Finalidades secundarias (opcionales):</h3>
                                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                                    <li>Generación de estadísticas de uso anónimas para mejorar la Plataforma</li>
                                    <li>Comunicación de actualizaciones y nuevas funcionalidades</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Derechos ARCO */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">4. Derechos ARCO</h2>
                        <p className="text-muted-foreground mb-4">
                            Conforme a la LFPDPPP, usted tiene derecho a:
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { letter: 'A', title: 'Acceso', desc: 'Conocer qué datos personales tenemos de usted y cómo los utilizamos.' },
                                { letter: 'R', title: 'Rectificación', desc: 'Corregir sus datos cuando sean inexactos o incompletos.' },
                                { letter: 'C', title: 'Cancelación', desc: 'Solicitar la eliminación de sus datos cuando no sea necesario conservarlos.' },
                                { letter: 'O', title: 'Oposición', desc: 'Oponerse al uso de sus datos para finalidades específicas.' },
                            ].map(({ letter, title, desc }) => (
                                <div key={letter} className="p-4 bg-card border border-border rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">{letter}</span>
                                        <span className="font-semibold text-foreground">{title}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{desc}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-muted-foreground mt-4">
                            Para ejercer sus derechos ARCO, envíe su solicitud a{' '}
                            <a href="mailto:privacidad@axomed.mx" className="text-blue-600 hover:underline">privacidad@axomed.mx</a>
                            {' '}con su nombre, descripción clara de la solicitud y copia de identificación oficial.
                            Responderemos en un plazo máximo de 20 días hábiles.
                        </p>
                    </section>

                    {/* Transferencias */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">5. Transferencia de Datos</h2>
                        <p className="text-muted-foreground mb-3">
                            Sus datos personales podrán ser compartidos con:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong className="text-foreground">Supabase (infraestructura de base de datos):</strong> Proveedor de almacenamiento seguro con cifrado en reposo y en tránsito.</li>
                            <li><strong className="text-foreground">Proveedores de comunicación (Twilio/Resend):</strong> Para el envío de recordatorios por WhatsApp y correo electrónico.</li>
                            <li><strong className="text-foreground">Autoridades competentes:</strong> Cuando así lo requiera la legislación aplicable.</li>
                        </ul>
                        <p className="text-muted-foreground mt-3">
                            No compartimos sus datos con terceros con fines comerciales o publicitarios.
                        </p>
                    </section>

                    {/* Seguridad */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">6. Medidas de Seguridad</h2>
                        <p className="text-muted-foreground">
                            Implementamos medidas técnicas, administrativas y físicas para proteger sus datos, incluyendo:
                            cifrado TLS en tránsito, cifrado AES-256 en reposo, autenticación segura, control de acceso
                            por roles, y auditorías periódicas de seguridad. No obstante, ningún sistema es 100% infalible.
                            Le recomendamos mantener la confidencialidad de sus credenciales de acceso.
                        </p>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">7. Uso de Cookies</h2>
                        <p className="text-muted-foreground">
                            La Plataforma utiliza cookies estrictamente necesarias para el funcionamiento de la sesión de usuario.
                            No utilizamos cookies de rastreo o publicidad de terceros. Puede configurar su navegador para rechazar
                            cookies, aunque esto puede afectar la funcionalidad de la Plataforma.
                        </p>
                    </section>

                    {/* Cambios */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">8. Modificaciones al Aviso</h2>
                        <p className="text-muted-foreground">
                            Este Aviso de Privacidad puede modificarse. Cualquier cambio será notificado a través de la Plataforma
                            y/o por correo electrónico con al menos 10 días hábiles de anticipación.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="border-t border-border pt-8">
                        <h2 className="text-xl font-bold text-foreground mb-3">9. Contacto y INAI</h2>
                        <p className="text-muted-foreground">
                            Si considera que su derecho a la protección de datos personales ha sido vulnerado, puede acudir ante
                            el <strong className="text-foreground">Instituto Nacional de Transparencia, Acceso a la Información y
                            Protección de Datos Personales (INAI)</strong> en{' '}
                            <a href="https://www.inai.org.mx" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                www.inai.org.mx
                            </a>.
                        </p>
                        <p className="text-muted-foreground mt-2">
                            Contacto directo:{' '}
                            <a href="mailto:privacidad@axomed.mx" className="text-blue-600 hover:underline font-medium">
                                privacidad@axomed.mx
                            </a>
                        </p>
                    </section>
                </div>

                {/* Footer nav */}
                <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between text-sm text-muted-foreground">
                    <p>© 2026 AxoMed. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <Link href="/terminos" className="hover:text-foreground transition">Términos de Uso</Link>
                        <Link href="/privacidad" className="hover:text-foreground transition font-medium text-foreground">Aviso de Privacidad</Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
