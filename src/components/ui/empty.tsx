import * as React from "react"
import { cn } from "@/lib/utils"

interface EmptyProps extends React.ComponentProps<"div"> {
    title: string
    description?: string
    icon?: React.ReactNode
}

export function Empty({ className, title, description, icon, ...props }: EmptyProps) {
    return (
        <div
            data-slot="empty"
            className={cn(
                "flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 p-8 text-center bg-neutral-50/20 hover:bg-neutral-50/40 transition-colors duration-200",
                className
            )}
            {...props}
        >
            {icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100/80 text-neutral-500 mb-3">
                    {icon}
                </div>
            )}
            <h3 className="font-heading text-sm font-semibold text-neutral-800">{title}</h3>
            {description && (
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">{description}</p>
            )}
        </div>
    )
}
