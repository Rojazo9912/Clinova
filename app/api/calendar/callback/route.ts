import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL)?.replace(/\/$/, '') || 'https://axomed.com.mx';

    if (!code) {
        return NextResponse.json({ error: 'Falta código de autorización' }, { status: 400 });
    }

    // Validate CSRF state token
    const savedState = request.cookies.get('gcal_oauth_state')?.value;
    if (!state || !savedState || state !== savedState) {
        return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=oauth_state_invalid`);
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${baseUrl}/api/calendar/callback`
        );

        // Cambiar código por tokens
        const { tokens } = await oauth2Client.getToken(code);

        // Obtener sesión de Supabase
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(`${baseUrl}/login?error=unauthorized`);
        }

        // Guardar los tokens en el perfil del usuario autenticado
        const { error } = await supabase
            .from('profiles')
            .update({
                gcal_access_token: tokens.access_token,
                gcal_refresh_token: tokens.refresh_token,
                gcal_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
            })
            .eq('id', user.id);

        if (error) {
            console.error('Error guardando tokens en DB:', error);
            return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=calendar_sync_failed`);
        }

        // Redirigir de vuelta a las configuraciones y limpiar la cookie de state
        const successResponse = NextResponse.redirect(`${baseUrl}/dashboard/settings?success=calendar_synced`);
        successResponse.cookies.delete('gcal_oauth_state');
        return successResponse;
    } catch (error) {
        console.error('Error en callback de calendar:', error);
        const errorResponse = NextResponse.redirect(`${baseUrl}/dashboard/settings?error=calendar_sync_failed`);
        errorResponse.cookies.delete('gcal_oauth_state');
        return errorResponse;
    }
}
