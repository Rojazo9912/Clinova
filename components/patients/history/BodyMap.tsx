'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'

export interface BodyPoint {
    id: string
    zone: string
    intensity: number // 0-10
}

interface BodyMapProps {
    points: BodyPoint[]
    onChange?: (points: BodyPoint[]) => void
    readOnly?: boolean
}

// Simplified body zones for interaction
const ZONES = [
    { id: 'head', name: 'Cabeza', x: 50, y: 5 },
    { id: 'neck', name: 'Cuello', x: 50, y: 15 },
    { id: 'l_shoulder', name: 'Hombro Izq.', x: 75, y: 18 },
    { id: 'r_shoulder', name: 'Hombro Der.', x: 25, y: 18 },
    { id: 'chest', name: 'Pecho', x: 50, y: 25 },
    { id: 'stomach', name: 'Abdomen', x: 50, y: 45 },
    { id: 'upper_back', name: 'Espalda Alta', x: 150, y: 25 }, // Secondary view (Back) offset x+100
    { id: 'lower_back', name: 'Lumbar', x: 150, y: 45 },
    { id: 'l_arm', name: 'Brazo Izq.', x: 85, y: 35 },
    { id: 'r_arm', name: 'Brazo Der.', x: 15, y: 35 },
    { id: 'l_hand', name: 'Mano Izq.', x: 95, y: 55 },
    { id: 'r_hand', name: 'Mano Der.', x: 5, y: 55 },
    { id: 'hips', name: 'Caderas', x: 50, y: 55 },
    { id: 'l_leg', name: 'Pierna Izq.', x: 65, y: 75 },
    { id: 'r_leg', name: 'Pierna Der.', x: 35, y: 75 },
    { id: 'l_knee', name: 'Rodilla Izq.', x: 65, y: 85 },
    { id: 'r_knee', name: 'Rodilla Der.', x: 35, y: 85 },
    { id: 'l_foot', name: 'Pie Izq.', x: 70, y: 95 },
    { id: 'r_foot', name: 'Pie Der.', x: 30, y: 95 },
]

export default function BodyMap({ points, onChange, readOnly = false }: BodyMapProps) {
    const [selectedZone, setSelectedZone] = useState<string | null>(null)

    const handleZoneClick = (zoneId: string) => {
        if (readOnly) return
        setSelectedZone(zoneId)
    }

    const updateIntensity = (intensity: number) => {
        if (!selectedZone || !onChange) return

        const existingPointIndex = points.findIndex(p => p.id === selectedZone)
        let newPoints = [...points]

        if (existingPointIndex >= 0) {
            if (intensity === 0) {
                newPoints = newPoints.filter(p => p.id !== selectedZone)
            } else {
                newPoints[existingPointIndex] = { ...newPoints[existingPointIndex], intensity }
            }
        } else if (intensity > 0) {
            const zone = ZONES.find(z => z.id === selectedZone)
            if (zone) {
                newPoints.push({ id: selectedZone, zone: zone.name, intensity })
            }
        }

        onChange(newPoints)
        setSelectedZone(null)
    }

    const getZoneColor = (zoneId: string) => {
        const point = points.find(p => p.id === zoneId)
        if (!point) return 'fill-slate-200 hover:fill-slate-300'

        // Heatmap colors
        if (point.intensity <= 3) return 'fill-yellow-200'
        if (point.intensity <= 6) return 'fill-orange-400'
        return 'fill-red-500' // High pain
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between">
                    Mapa Corporal
                    {selectedZone && !readOnly && (
                        <div className="flex gap-1 text-xs">
                            <span className="text-slate-500 mr-2 items-center flex">
                                {ZONES.find(z => z.id === selectedZone)?.name}:
                            </span>
                            {[0, 2, 5, 8, 10].map(val => (
                                <button
                                    key={val}
                                    onClick={() => updateIntensity(val)}
                                    className={`px-2 py-0.5 rounded ${val === 0 ? 'bg-slate-100' :
                                            val <= 3 ? 'bg-yellow-100 text-yellow-700' :
                                                val <= 6 ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'
                                        }`}
                                >
                                    {val === 0 ? 'Borrar' : val}
                                </button>
                            ))}
                        </div>
                    )}
                </CardTitle>
                <CardDescription>
                    {readOnly ? 'Zonas registradas' : 'Toca una zona para registrar intensidad (1-10)'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative w-full aspect-[4/3] max-w-lg mx-auto bg-slate-50/50 rounded-lg border border-slate-100">
                    <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-sm">
                        {/* Front Body Silhouette (Abstract) */}
                        <g transform="translate(0,0)">
                            <text x="50" y="5" fontSize="4" textAnchor="middle" fill="#94a3b8">FRENTE</text>

                            {/* Head */}
                            <circle
                                cx="50" cy="10" r="6"
                                className={`cursor-pointer transition-colors duration-200 ${getZoneColor('head')}`}
                                onClick={() => handleZoneClick('head')}
                            />
                            {/* Torso */}
                            <path
                                d="M40 20 L60 20 L55 50 L45 50 Z"
                                className={`cursor-pointer transition-colors duration-200 ${getZoneColor('chest')}`}
                                onClick={() => handleZoneClick('chest')}
                            />
                            {/* Hips/Stomach */}
                            <rect
                                x="42" y="50" width="16" height="10" rx="2"
                                className={`cursor-pointer transition-colors duration-200 ${getZoneColor('hips')}`}
                                onClick={() => handleZoneClick('hips')}
                            />

                            {/* Shoulders */}
                            <circle cx="30" cy="20" r="5" className={`cursor-pointer ${getZoneColor('r_shoulder')}`} onClick={() => handleZoneClick('r_shoulder')} />
                            <circle cx="70" cy="20" r="5" className={`cursor-pointer ${getZoneColor('l_shoulder')}`} onClick={() => handleZoneClick('l_shoulder')} />

                            {/* Arms */}
                            <rect x="15" y="25" width="8" height="25" rx="3" className={`cursor-pointer ${getZoneColor('r_arm')}`} onClick={() => handleZoneClick('r_arm')} />
                            <rect x="77" y="25" width="8" height="25" rx="3" className={`cursor-pointer ${getZoneColor('l_arm')}`} onClick={() => handleZoneClick('l_arm')} />

                            {/* Hands */}
                            <circle cx="19" cy="55" r="4" className={`cursor-pointer ${getZoneColor('r_hand')}`} onClick={() => handleZoneClick('r_hand')} />
                            <circle cx="81" cy="55" r="4" className={`cursor-pointer ${getZoneColor('l_hand')}`} onClick={() => handleZoneClick('l_hand')} />

                            {/* Legs */}
                            <rect x="35" y="62" width="10" height="25" rx="3" className={`cursor-pointer ${getZoneColor('r_leg')}`} onClick={() => handleZoneClick('r_leg')} />
                            <rect x="55" y="62" width="10" height="25" rx="3" className={`cursor-pointer ${getZoneColor('l_leg')}`} onClick={() => handleZoneClick('l_leg')} />

                            {/* Knees */}
                            <circle cx="40" cy="90" r="3" className={`cursor-pointer ${getZoneColor('r_knee')}`} onClick={() => handleZoneClick('r_knee')} />
                            <circle cx="60" cy="90" r="3" className={`cursor-pointer ${getZoneColor('l_knee')}`} onClick={() => handleZoneClick('l_knee')} />
                        </g>

                        {/* Back Body Silhouette */}
                        <g transform="translate(100,0)">
                            <text x="50" y="5" fontSize="4" textAnchor="middle" fill="#94a3b8">ESPALDA</text>

                            {/* Head Back */}
                            <circle cx="50" cy="10" r="6" className={`cursor-pointer fill-slate-200 hover:fill-slate-300`} />

                            {/* Back Spine/Upper */}
                            <path
                                d="M35 20 L65 20 L60 45 L40 45 Z"
                                className={`cursor-pointer transition-colors duration-200 ${getZoneColor('upper_back')}`}
                                onClick={() => handleZoneClick('upper_back')}
                            />
                            {/* Lumbar */}
                            <rect
                                x="40" y="45" width="20" height="12" rx="2"
                                className={`cursor-pointer transition-colors duration-200 ${getZoneColor('lower_back')}`}
                                onClick={() => handleZoneClick('lower_back')}
                            />
                        </g>
                    </svg>

                    {/* Legend */}
                    <div className="absolute bottom-2 left-2 flex gap-2 text-[10px] text-slate-500 bg-white/80 p-1 rounded backdrop-blur-sm">
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-200"></span> Leve</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Mod.</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Intenso</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
