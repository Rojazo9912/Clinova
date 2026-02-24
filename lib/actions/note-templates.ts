'use server'

import { createClient } from '@/lib/supabase/server'

export interface NoteTemplate {
    id: string
    clinic_id: string
    created_by: string
    name: string
    category: 'diagnosis' | 'treatment' | 'progress' | 'general'
    content: string
    variables_used: string[]
    is_shared: boolean
    created_at: string
    updated_at: string
}

export async function getNoteTemplates(category?: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile?.clinic_id) return []

    let query = supabase
        .from('note_templates')
        .select('*')
        .eq('clinic_id', profile.clinic_id)
        .order('category')
        .order('name')

    if (category) {
        query = query.eq('category', category)
    }

    const { data: templates } = await query

    return templates || []
}

export async function createNoteTemplate(data: {
    name: string
    category: string
    content: string
    is_shared: boolean
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile?.clinic_id) throw new Error('No clinic found')

    // Extract variables from content
    const variables = extractVariables(data.content)

    const { error } = await supabase
        .from('note_templates')
        .insert({
            clinic_id: profile.clinic_id,
            created_by: user.id,
            name: data.name,
            category: data.category,
            content: data.content,
            variables_used: variables,
            is_shared: data.is_shared
        })

    if (error) throw error

    return { success: true }
}

export async function updateNoteTemplate(id: string, data: {
    name: string
    category: string
    content: string
    is_shared: boolean
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Extract variables from content
    const variables = extractVariables(data.content)

    const { error } = await supabase
        .from('note_templates')
        .update({
            name: data.name,
            category: data.category,
            content: data.content,
            variables_used: variables,
            is_shared: data.is_shared,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('created_by', user.id)

    if (error) throw error

    return { success: true }
}

export async function deleteNoteTemplate(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('note_templates')
        .delete()
        .eq('id', id)
        .eq('created_by', user.id)

    if (error) throw error

    return { success: true }
}

export async function applyTemplate(templateId: string, variables: Record<string, string | number>) {
    const supabase = await createClient()

    const { data: template } = await supabase
        .from('note_templates')
        .select('content')
        .eq('id', templateId)
        .single()

    if (!template) throw new Error('Template not found')

    return replaceVariables(template.content, variables)
}

function extractVariables(content: string): string[] {
    const regex = /\{([a-z_]+)\}/g
    const matches = content.matchAll(regex)
    const variables = new Set<string>()

    for (const match of matches) {
        variables.add(match[1])
    }

    return Array.from(variables)
}

function replaceVariables(template: string, variables: Record<string, string | number>): string {
    let result = template

    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{${key}\\}`, 'g')
        result = result.replace(regex, String(value))
    }

    return result
}
