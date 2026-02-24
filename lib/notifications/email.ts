import { Resend } from 'resend'

export async function sendEmail(to: string, subject: string, html: string) {
    const resendKey = process.env.RESEND_API_KEY

    if (!resendKey) {
        console.warn('Resend client not initialized. Missing environment variables.')
        return { success: false, error: 'Resend not configured' }
    }

    const resend = new Resend(resendKey)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    try {
        const data = await resend.emails.send({
            from: fromEmail,
            to: to,
            subject: subject,
            html: html
        })
        return { success: true, data }
    } catch (error: any) {
        console.error('Error sending Email:', error)
        return { success: false, error: error.message }
    }
}
