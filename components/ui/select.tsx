import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

// Simplified Select implementation using native <select> for robustness without Radix
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, onChange, onValueChange, ...props }, ref) => {

        const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            if (onChange) onChange(e)
            if (onValueChange) onValueChange(e.target.value)
        }

        return (
            <div className="relative">
                <select
                    className={cn(
                        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                        className
                    )}
                    ref={ref}
                    onChange={handleChange}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
        )
    }
)
Select.displayName = "Select"

// Compatibility wrappers to match the Radix API used in other components
const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>
const SelectValue = ({ placeholder }: { placeholder?: string }) => <>{placeholder}</>
const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
const SelectItem = ({ value, children, ...props }: any) => (
    <option value={value} {...props}>{children}</option>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
