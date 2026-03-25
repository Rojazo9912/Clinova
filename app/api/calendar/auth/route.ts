import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL)?.replace(/\/$/, '') || 'https://axomed.com.mx';

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${baseUrl}/api/calendar/callback`
    );

    const scopes = ['https://www.googleapis.com/auth/calendar.events'];

    // Generate CSRF state token to validate in the callback
    const state = crypto.randomBytes(16).toString('hex');

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
        state,
    });

    const response = NextResponse.redirect(url);

    // Store state in a secure httpOnly cookie (10-minute TTL)
    response.cookies.set('gcal_oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
    });

    return response;
}
