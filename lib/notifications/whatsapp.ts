import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_PHONE_NUMBER

let client: any = null

if (accountSid && authToken) {
    client = twilio(accountSid, authToken)
}

export async function sendWhatsAppMessage(to: string, body: string) {
    if (!client) {
        console.warn('Twilio client not initialized. Missing environment variables.')
        return { success: false, error: 'Twilio not configured' }
    }

    try {
        const message = await client.messages.create({
            body: body,
            from: `whatsapp:${fromNumber}`,
            to: `whatsapp:${to}`
        })
        return { success: true, messageId: message.sid }
    } catch (error: any) {
        console.error('Error sending WhatsApp:', error)
        return { success: false, error: error.message }
    }
}
