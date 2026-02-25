import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Falta código de autorización' }, { status: 400 });
    }

    const baseUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');

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

        // Redirigir de vuelta a las configuraciones
        return NextResponse.redirect(`${baseUrl}/dashboard/settings?success=calendar_synced`);
    } catch (error) {
        console.error('Error en callback de calendar:', error);
        return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=calendar_sync_failed`);
    }
}
