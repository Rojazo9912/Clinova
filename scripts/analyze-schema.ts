
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase keys in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeSchema() {
    console.log('Fetching schema information...');

    // We can't query information_schema directly with the JS client easily unless we wrap it in a function,
    // OR we rely on the PostgREST introspection if exposed.
    // A better way with Service Role is to just list tables if possible, 
    // but standard client doesn't have a "list tables" method.

    // Strategy: Try to fetch a list of common table names or use a known RPC if it exists.
    // Fallback: If we can't inspect schema via JS client easily without SQL editor access,
    // we might have to ask the user to run a query or provide the schema.

    // However, often 'information_schema' is accessible via raw select if permissions allow.
    // Let's try raw RPC call if we had one. 

    // Actually, easiest way is to try to select from 'information_schema.tables'.
    // But PostgREST usually doesn't expose system schemas.

    // Alternative: Just check for existence of V2 planned tables to see if they collide.
    const tablesToCheck = ['clinics', 'profiles', 'patients', 'appointments', 'medical_records', 'users', 'citas'];
    const report: Record<string, any> = {};

    for (const table of tablesToCheck) {
        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
            // Error usually means table doesn't exist (404) or permission denied (401/403)
            report[table] = { status: 'error_or_missing', details: error.message, code: error.code };
        } else {
            // Table exists
            report[table] = { status: 'exists', sample_row: data?.[0] || 'empty' };
        }
    }

    const reportPath = path.join(process.cwd(), 'schema-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`Report saved to ${reportPath}`);
}

analyzeSchema();
