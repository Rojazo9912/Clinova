'use server'

import { Resend } from 'resend'

interface PhysioWelcomeEmailData {
    to: string
    physioName: string
    clinicName: string
    email: string
    tempPassword: string
    loginUrl: string
}

export async function sendPhysioWelcomeEmail(data: PhysioWelcomeEmailData) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    try {
        const { error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'noreply@clinova.com',
            to: data.to,
            subject: `Bienvenido al equipo de ${data.clinicName}`,
            html: `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f6f8; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #0f766e; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }
                        .header h1 { margin: 0; font-size: 22px; }
                        .header p { margin: 4px 0 0; font-size: 14px; opacity: 0.9; }
                        .content { background: #ffffff; padding: 32px; border-radius: 0 0 8px 8px; }
                        .credentials { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #0f766e; }
                        .credentials h3 { margin-top: 0; color: #0f766e; }
                        .credentials code { background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 14px; }
                        .button { display: inline-block; background: #0f766e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; }
                        .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; font-size: 14px; }
                        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>${data.clinicName}</h1>
                            <p>Sistema de Gestión Clínica</p>
                        </div>
                        <div class="content">
                            <h2 style="margin-top: 0;">¡Bienvenido al equipo!</h2>

                            <p>Hola <strong>${data.physioName}</strong>,</p>

                            <p>Has sido registrado como fisioterapeuta en <strong>${data.clinicName}</strong>. Ya puedes acceder al sistema para gestionar tus citas, pacientes y más.</p>

                            <div class="credentials">
                                <h3>Tus credenciales de acceso:</h3>
                                <p><strong>Email:</strong> ${data.email}</p>
                                <p><strong>Contraseña:</strong> <code>${data.tempPassword}</code></p>
                            </div>

                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${data.loginUrl}" class="button">Acceder al Sistema</a>
                            </div>

                            <div class="warning">
                                <strong>Importante:</strong> Te recomendamos cambiar tu contraseña después de iniciar sesión por primera vez desde la sección de configuración.
                            </div>

                            <p style="color: #6b7280; font-size: 14px;">Si no esperabas este correo, puedes ignorarlo de forma segura.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${data.clinicName} — Todos los derechos reservados</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        })

        if (error) {
            console.error('Error sending physio welcome email:', error)
            throw error
        }

        return { success: true }
    } catch (error) {
        console.error('Failed to send physio welcome email:', error)
        throw error
    }
}
