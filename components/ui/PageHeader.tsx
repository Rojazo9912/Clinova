import { ReactNode } from 'react'

interface PageHeaderProps {
    title: string
    description?: string
    children?: ReactNode
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-200/60">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{title}</h1>
                {description && <p className="text-slate-500 mt-2 text-lg font-light leading-relaxed">{description}</p>}
            </div>
            {children && <div className="flex gap-3">{children}</div>}
        </div>
    )
}
