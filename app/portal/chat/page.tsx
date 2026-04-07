'use client'

/**
 * REQUIRES: Run this SQL in Supabase before using this page.
 *
 * CREATE TABLE portal_messages (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   clinic_id UUID REFERENCES clinics(id),
 *   patient_id UUID REFERENCES patients(id),
 *   sender_role TEXT NOT NULL CHECK (sender_role IN ('patient', 'staff')),
 *   sender_name TEXT,
 *   content TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   read_by_patient BOOLEAN DEFAULT FALSE,
 *   read_by_staff BOOLEAN DEFAULT FALSE
 * );
 *
 * ALTER TABLE portal_messages ENABLE ROW LEVEL SECURITY;
 *
 * CREATE POLICY "Patients see own messages"
 * ON portal_messages FOR ALL
 * USING (patient_id IN (
 *   SELECT patient_id FROM patient_users WHERE user_id = auth.uid()
 * ));
 */

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPatientProfile } from '@/lib/actions/portal'
import { Send, Loader2, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Message {
    id: string
    sender_role: 'patient' | 'staff'
    sender_name: string | null
    content: string
    created_at: string
    read_by_patient: boolean
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [patientId, setPatientId] = useState<string | null>(null)
    const [clinicId, setClinicId] = useState<string | null>(null)
    const [patientName, setPatientName] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        async function init() {
            setLoading(true)
            const profile = await getPatientProfile()
            if (!profile) { setLoading(false); return }
            setPatientId(profile.id)
            setClinicId(profile.clinic_id)
            setPatientName(`${profile.first_name} ${profile.last_name}`)

            // Load existing messages
            const { data } = await supabase
                .from('portal_messages')
                .select('*')
                .eq('patient_id', profile.id)
                .order('created_at', { ascending: true })

            setMessages((data as Message[]) || [])

            // Mark messages from staff as read
            await supabase
                .from('portal_messages')
                .update({ read_by_patient: true })
                .eq('patient_id', profile.id)
                .eq('sender_role', 'staff')
                .eq('read_by_patient', false)

            setLoading(false)

            // Subscribe to new messages via Realtime
            const channel = supabase
                .channel(`portal-chat-${profile.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'portal_messages',
                        filter: `patient_id=eq.${profile.id}`
                    },
                    (payload) => {
                        setMessages(prev => [...prev, payload.new as Message])
                    }
                )
                .subscribe()

            return () => { supabase.removeChannel(channel) }
        }

        init()
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function handleSend() {
        if (!input.trim() || !patientId || !clinicId || sending) return
        setSending(true)
        const content = input.trim()
        setInput('')

        const { error } = await supabase.from('portal_messages').insert({
            patient_id: patientId,
            clinic_id: clinicId,
            sender_role: 'patient',
            sender_name: patientName,
            content,
            read_by_staff: false,
            read_by_patient: true
        })

        if (error) {
            console.error('Error sending message:', error)
            setInput(content)
        }
        setSending(false)
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Group messages by date
    const grouped: { date: string; msgs: Message[] }[] = []
    for (const msg of messages) {
        const day = format(new Date(msg.created_at), 'yyyy-MM-dd')
        const last = grouped[grouped.length - 1]
        if (last && last.date === day) last.msgs.push(msg)
        else grouped.push({ date: day, msgs: [msg] })
    }

    if (loading) {
        return (
            <div className="flex flex-col h-[calc(100vh-180px)]">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">Tu Clínica</p>
                        <p className="text-xs text-muted-foreground">Cargando...</p>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-180px)]">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-border flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="font-semibold text-foreground">Tu Clínica</p>
                    <p className="text-xs text-green-500 font-medium">En línea</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                        <p className="text-muted-foreground text-sm">No hay mensajes aún.</p>
                        <p className="text-muted-foreground text-xs mt-1">Escribe tu mensaje y la clínica te responderá pronto.</p>
                    </div>
                )}

                {grouped.map(group => (
                    <div key={group.date}>
                        {/* Day separator */}
                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs text-muted-foreground font-medium">
                                {format(new Date(group.date), "EEEE d 'de' MMMM", { locale: es })}
                            </span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        {/* Messages for this day */}
                        <div className="space-y-2">
                            {group.msgs.map(msg => {
                                const isPatient = msg.sender_role === 'patient'
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[75%] ${isPatient ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                            {!isPatient && (
                                                <span className="text-xs text-muted-foreground ml-1">
                                                    {msg.sender_name || 'Clínica'}
                                                </span>
                                            )}
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                isPatient
                                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                                    : 'bg-muted text-foreground rounded-bl-sm'
                                            }`}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground px-1">
                                                {format(new Date(msg.created_at), 'HH:mm')}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 pt-3 border-t border-border">
                <div className="flex gap-2 items-end">
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe un mensaje... (Enter para enviar)"
                        rows={1}
                        className="flex-1 resize-none px-4 py-3 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-muted-foreground"
                        style={{ maxHeight: '120px' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        className="w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition flex-shrink-0"
                    >
                        {sending
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Send className="w-4 h-4" />
                        }
                    </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">Presiona Enter para enviar · Shift+Enter para nueva línea</p>
            </div>
        </div>
    )
}
