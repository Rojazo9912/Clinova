import { ReactNode } from 'react'

interface PageHeaderProps {
    title: string
    description?: string
    children?: ReactNode
    emoji?: string
}

export default function PageHeader({ title, description, children, emoji }: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    {emoji && <span className="text-2xl">{emoji}</span>}
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
            </div>
            {children && <div className="flex gap-3 items-center">{children}</div>}
        </div>
    )
}
