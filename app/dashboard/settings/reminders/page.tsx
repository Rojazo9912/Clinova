'use client'

import { useEffect, useState } from 'react'
import { getReminderSettings, updateReminderSettings, getReminderTemplates, updateReminderTemplate } from '@/lib/actions/reminders'
import { Bell, Clock, MessageSquare, Mail, Save } from 'lucide-react'

interface ReminderSettings {
    reminder_times: number[]
    send_start_hour: number
    send_end_hour: number
    whatsapp_enabled: boolean
    email_enabled: boolean
}

interface Template {
    id: string
    template_type: string
    subject: string | null
    message: string
}

export default function RemindersSettingsPage() {
    const [settings, setSettings] = useState<ReminderSettings>({
        reminder_times: [24],
        send_start_hour: 9,
        send_end_hour: 20,
        whatsapp_enabled: true,
        email_enabled: true
    })
    const [templates, setTemplates] = useState<Template[]>([])
    const [activeTab, setActiveTab] = useState<'whatsapp' | 'email'>('whatsapp')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const [settingsData, templatesData] = await Promise.all([
            getReminderSettings(),
            getReminderTemplates()
        ])

        if (settingsData) setSettings(settingsData)
        if (templatesData) setTemplates(templatesData as Template[])
        setLoading(false)
    }

    async function handleSaveSettings() {
        setSaving(true)
        try {
            await updateReminderSettings(settings)
            alert('Configuración guardada exitosamente')
        } catch (error: any) {
            alert('Error: ' + error.message)
        }
        setSaving(false)
    }

    async function handleSaveTemplate(templateType: string) {
        setSaving(true)
        try {
            const template = templates.find(t => t.template_type === templateType)
            if (!template) return

            await updateReminderTemplate(templateType, {
                subject: template.subject || undefined,
                message: template.message
            })
            alert('Plantilla guardada exitosamente')
        } catch (error: any) {
            alert('Error: ' + error.message)
        }
        setSaving(false)
    }

    function toggleReminderTime(hours: number) {
        const times = [...settings.reminder_times]
        const index = times.indexOf(hours)

        if (index > -1) {
            times.splice(index, 1)
        } else {
            times.push(hours)
            times.sort((a, b) => b - a) // Sort descending
        }

        setSettings({ ...settings, reminder_times: times })
    }

    function updateTemplate(templateType: string, field: 'subject' | 'message', value: string) {
        setTemplates(templates.map(t =>
            t.template_type === templateType
                ? { ...t, [field]: value }
                : t
        ))
    }

    const whatsappTemplate = templates.find(t => t.template_type === 'whatsapp_reminder')
    const emailTemplate = templates.find(t => t.template_type === 'email_reminder')

    if (loading) {
        return <div className="p-8">Cargando...</div>
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Configuración de Recordatorios</h1>
                <p className="text-slate-600 mt-2">Personaliza cómo y cuándo se envían los recordatorios</p>
            </div>

            {/* Settings Section */}
            <div className="bg-white rounded-xl border p-6 space-y-6">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold">Configuración General</h2>
                </div>

                {/* Reminder Times */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                        Tiempos de Recordatorio
                    </label>
                    <div className="flex gap-4">
                        {[48, 24, 2].map(hours => (
                            <label key={hours} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.reminder_times.includes(hours)}
                                    onChange={() => toggleReminderTime(hours)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-sm text-slate-700">{hours}h antes</span>
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Selecciona uno o más tiempos para enviar recordatorios
                    </p>
                </div>

                {/* Send Window */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Hora de inicio
                        </label>
                        <select
                            value={settings.send_start_hour}
                            onChange={(e) => setSettings({ ...settings, send_start_hour: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            {Array.from({ length: 24 }, (_, i) => (
                                <option key={i} value={i}>{i}:00</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Hora de fin
                        </label>
                        <select
                            value={settings.send_end_hour}
                            onChange={(e) => setSettings({ ...settings, send_end_hour: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            {Array.from({ length: 24 }, (_, i) => (
                                <option key={i} value={i}>{i}:00</option>
                            ))}
                        </select>
                    </div>
                </div>
                <p className="text-xs text-slate-500">
                    Los recordatorios solo se enviarán dentro de esta ventana horaria
                </p>

                {/* Channel Toggles */}
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.whatsapp_enabled}
                            onChange={(e) => setSettings({ ...settings, whatsapp_enabled: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded"
                        />
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-slate-700">WhatsApp habilitado</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.email_enabled}
                            onChange={(e) => setSettings({ ...settings, email_enabled: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded"
                        />
                        <Mail className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">Email habilitado</span>
                    </label>
                </div>

                <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
            </div>

            {/* Templates Section */}
            <div className="bg-white rounded-xl border p-6 space-y-6">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold">Plantillas de Mensajes</h2>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b">
                    <button
                        onClick={() => setActiveTab('whatsapp')}
                        className={`px-4 py-2 font-medium transition ${activeTab === 'whatsapp'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        WhatsApp
                    </button>
                    <button
                        onClick={() => setActiveTab('email')}
                        className={`px-4 py-2 font-medium transition ${activeTab === 'email'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Email
                    </button>
                </div>

                {/* WhatsApp Template */}
                {activeTab === 'whatsapp' && whatsappTemplate && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Mensaje de WhatsApp
                            </label>
                            <textarea
                                value={whatsappTemplate.message}
                                onChange={(e) => updateTemplate('whatsapp_reminder', 'message', e.target.value)}
                                rows={10}
                                className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Variables disponibles: {'{patient_name}'}, {'{date}'}, {'{time}'}, {'{service}'}, {'{clinic_name}'}, {'{hours_before}'}
                            </p>
                        </div>
                        <button
                            onClick={() => handleSaveTemplate('whatsapp_reminder')}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Guardando...' : 'Guardar Plantilla WhatsApp'}
                        </button>
                    </div>
                )}

                {/* Email Template */}
                {activeTab === 'email' && emailTemplate && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Asunto del Email
                            </label>
                            <input
                                type="text"
                                value={emailTemplate.subject || ''}
                                onChange={(e) => updateTemplate('email_reminder', 'subject', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Mensaje del Email
                            </label>
                            <textarea
                                value={emailTemplate.message}
                                onChange={(e) => updateTemplate('email_reminder', 'message', e.target.value)}
                                rows={12}
                                className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Variables disponibles: {'{patient_name}'}, {'{date}'}, {'{time}'}, {'{service}'}, {'{clinic_name}'}, {'{hours_before}'}
                            </p>
                        </div>
                        <button
                            onClick={() => handleSaveTemplate('email_reminder')}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Guardando...' : 'Guardar Plantilla Email'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
