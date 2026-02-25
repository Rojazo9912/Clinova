import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const reqUrl = new URL(request.url);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || reqUrl.origin;

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${baseUrl}/api/calendar/callback`
    );

    const scopes = ['https://www.googleapis.com/auth/calendar.events'];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', // Forzar a que nos dé un refresh token
        scope: scopes,
    });

    return NextResponse.redirect(url);
}
