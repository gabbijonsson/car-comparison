import { Link } from '@tanstack/react-router'
import { AlertTriangle, Home } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { sv } from '~/lib/i18n/sv'

type ErrorPageContentProps = {
  title?: string
  description?: string
  showHomeLink?: boolean
  showRetry?: boolean
  onRetry?: () => void
}

export function ErrorPageContent({
  title = sv.errors.title,
  description = sv.errors.description,
  showHomeLink = true,
  showRetry = false,
  onRetry,
}: ErrorPageContentProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-7 text-destructive" aria-hidden />
      </div>
      <div className="grid max-w-md gap-2">
        <h1 className="font-heading text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {showRetry && onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            {sv.errors.retry}
          </Button>
        ) : null}
        {showHomeLink ? (
          <Button render={<Link to="/" />}>
            <Home data-icon="inline-start" />
            {sv.errors.backHome}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
