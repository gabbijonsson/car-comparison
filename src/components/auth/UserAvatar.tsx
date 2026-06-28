import { cn } from '~/lib/utils'

type UserAvatarProps = {
  name?: string | null
  email?: string | null
  image?: string | null
  className?: string
}

function initialsFromUser(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim() || '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

export function UserAvatar({ name, email, image, className }: UserAvatarProps) {
  const initials = initialsFromUser(name, email)

  if (image) {
    return <img src={image} alt="" className={cn('size-8 rounded-full object-cover', className)} />
  }

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground',
        className,
      )}
    >
      {initials}
    </span>
  )
}
