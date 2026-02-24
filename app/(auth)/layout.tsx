export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 p-4">
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    )
}
