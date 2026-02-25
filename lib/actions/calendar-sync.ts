import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';

export async function exportAppointmentToGoogleCalendar(
    userId: string,
    appointmentData: { title: string; start: Date; end: Date; description?: string }
) {
    const supabase = await createClient();

    // Obtener los tokens del fisioterapeuta
    const { data: profile } = await supabase
        .from('profiles')
        .select('gcal_access_token, gcal_refresh_token, gcal_token_expiry, full_name')
        .eq('id', userId)
        .single();

    if (!profile || !profile.gcal_refresh_token) {
        // El usuario no tiene vinculado su calendario
        return null;
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
            access_token: profile.gcal_access_token,
            refresh_token: profile.gcal_refresh_token,
            expiry_date: profile.gcal_token_expiry ? new Date(profile.gcal_token_expiry).getTime() : null,
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
            summary: appointmentData.title,
            description: appointmentData.description || 'Cita generada desde Clinova.',
            start: {
                dateTime: appointmentData.start.toISOString(),
            },
            end: {
                dateTime: appointmentData.end.toISOString(),
            },
        };

        console.log('Sending event payload to GCal:', JSON.stringify(event, null, 2))

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });

        console.log('Event successfully inserted:', response.data.htmlLink)
        return response.data;
    } catch (error: any) {
        console.error('Error exportando evento a Google Calendar:', error.message || error);
        return { error: error.message || 'Unknown error' };
    }
}
