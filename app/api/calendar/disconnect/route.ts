import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                gcal_access_token: null,
                gcal_refresh_token: null,
                gcal_token_expiry: null,
                gcal_calendar_id: null
            })
            .eq('id', user.id);

        if (error) throw error;

        // Redirect or return success based on request type
        const referer = request.headers.get('referer') || '/dashboard/settings';
        return NextResponse.redirect(new URL(referer, request.url));
    } catch (error) {
        console.error('Error disconnecting calendar:', error);
        return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
    }
}
