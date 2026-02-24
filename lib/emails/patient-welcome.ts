'use server'

import { Resend } from 'resend'


interface WelcomeEmailData {
    to: string
    patientName: string
    clinicName: string
    email: string
    tempPassword: string
    portalUrl: string
}

export async function sendPatientWelcomeEmail(data: WelcomeEmailData) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    try {
        const { error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'noreply@clinova.com',
            to: data.to,
            subject: `Bienvenido al Portal de ${data.clinicName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
                        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                        .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
                        .features { list-style: none; padding: 0; }
                        .features li { padding: 8px 0; }
                        .features li:before { content: "✅ "; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>¡Bienvenido al Portal de Pacientes!</h1>
                        </div>
                        <div class="content">
                            <p>Hola <strong>${data.patientName}</strong>,</p>
                            
                            <p>¡Bienvenido al portal de pacientes de <strong>${data.clinicName}</strong>!</p>
                            
                            <p>Ahora puedes gestionar tus citas y ver tu información médica desde tu celular o computadora, en cualquier momento.</p>
                            
                            <div class="credentials">
                                <h3>🔐 Tus credenciales de acceso:</h3>
                                <p><strong>Email:</strong> ${data.email}</p>
                                <p><strong>Contraseña temporal:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${data.tempPassword}</code></p>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="${data.portalUrl}" class="button">Acceder al Portal</a>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ IMPORTANTE:</strong> Por seguridad, debes cambiar tu contraseña al iniciar sesión por primera vez.
                            </div>
                            
                            <h3>¿Qué puedes hacer en el portal?</h3>
                            <ul class="features">
                                <li>Ver tus próximas citas</li>
                                <li>Agendar nuevas citas</li>
                                <li>Cancelar o reagendar citas</li>
                                <li>Ver tu historial médico</li>
                                <li>Descargar recibos de pago</li>
                                <li>Ver ejercicios asignados</li>
                            </ul>
                            
                            <p style="margin-top: 30px;">¿Necesitas ayuda? Contáctanos y con gusto te asistiremos.</p>
                            
                            <p>Saludos,<br><strong>Equipo de ${data.clinicName}</strong></p>
                        </div>
                    </div>
                </body>
                </html>
            `
        })

        if (error) {
            console.error('Error sending welcome email:', error)
            throw error
        }

        return { success: true }
    } catch (error) {
        console.error('Failed to send welcome email:', error)
        throw error
    }
}
