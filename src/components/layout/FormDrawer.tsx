import type { ReactNode } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet'
import { cn } from '~/lib/utils'

type FormDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
}

export function FormDrawer({ open, onOpenChange, title, description, children }: FormDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          'gap-0 p-0',
          'max-md:inset-0 max-md:h-dvh max-md:w-screen max-md:max-w-none max-md:rounded-none max-md:border-0',
          'md:h-full md:w-full md:max-w-xl md:border-l',
        )}
      >
        <SheetHeader className="border-b border-border px-6 py-4 text-left">
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
