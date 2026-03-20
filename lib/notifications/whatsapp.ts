const META_API_VERSION = 'v21.0'
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

export async function sendWhatsAppMessage(
    to: string,
    body: string,
    phoneNumberId?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const resolvedPhoneNumberId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID

    if (!accessToken || !resolvedPhoneNumberId) {
        console.warn('WhatsApp not configured. Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID.')
        return { success: false, error: 'WhatsApp not configured' }
    }

    // Normalize phone number: remove spaces/dashes, ensure no leading +
    const normalizedTo = to.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '')

    try {
        const response = await fetch(`${META_BASE_URL}/${resolvedPhoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: normalizedTo,
                type: 'text',
                text: { body },
            }),
        })

        const data = await response.json() as any

        if (!response.ok) {
            const errorMsg = data?.error?.message || `HTTP ${response.status}`
            console.error('WhatsApp API error:', data)
            return { success: false, error: errorMsg }
        }

        const messageId = data?.messages?.[0]?.id
        return { success: true, messageId }
    } catch (error: any) {
        console.error('Error sending WhatsApp:', error)
        return { success: false, error: error.message }
    }
}
