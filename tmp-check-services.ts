import { createClient } from './lib/supabase/server'

async function checkServices() {
    const supabase = await createClient()
    const { data, error } = await supabase.from('services').select('*').limit(1)
    if (error) {
        console.error(error)
    } else {
        console.log(JSON.stringify(data, null, 2))
    }
}

checkServices()
