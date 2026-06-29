import { Link } from '@tanstack/react-router'
import { sv } from '~/lib/i18n/sv'

const navItems = [
  { to: '/', label: sv.nav.overview },
  { to: '/prospects', label: sv.nav.prospects },
  { to: '/compare', label: sv.nav.compare },
  { to: '/equipment', label: sv.nav.equipment },
  { to: '/activity', label: sv.nav.activity },
  { to: '/settings', label: sv.nav.settings },
] as const

export function AppNav() {
  return (
    <nav aria-label="Huvudmeny" className="flex flex-wrap items-center gap-1 md:gap-2">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
          activeProps={{ className: 'active' }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
