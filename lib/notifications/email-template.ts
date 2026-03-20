export function getBrandedEmailHtml(title: string, contentHtml: string): string {
    const primaryColor = '#2563eb'; // Blue 600
    const lightBg = '#f8fafc'; // Slate 50
    const cardBg = '#ffffff'; // White
    const textColor = '#334155'; // Slate 700
    const currentYear = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${lightBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${textColor}; -webkit-font-smoothing: antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0; padding: 0; width: 100%; background-color: ${lightBg};">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table class="email-container" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0; padding: 0; max-width: 600px; background-color: ${cardBg}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 32px 24px; background-color: #ffffff; border-bottom: 2px solid #e2e8f0;">
                            <!-- Reemplazar src por la URL real en producción -->
                            <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: ${primaryColor}; letter-spacing: -0.5px;">AxoMed</h1>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td align="left" style="padding: 40px 32px; font-size: 16px; line-height: 1.6; color: ${textColor};">
                            ${contentHtml}
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 32px;">
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 24px 32px; background-color: #f8fafc;">
                            <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">
                                Recibes este correo como parte de tu atención o configuración en <b>AxoMed</b>.<br>
                                Si tienes alguna duda, por favor contacta a tu clínica.
                            </p>
                            <p style="margin: 16px 0 0; font-size: 13px; color: #94a3b8;">
                                &copy; ${currentYear} AxoMed. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Spacer -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr><td height="40"></td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}
