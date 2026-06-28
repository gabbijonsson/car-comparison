import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { AppShell } from '~/components/layout/AppShell'
import { ConfirmDialog } from '~/components/layout/ConfirmDialog'
import { FormDrawer } from '~/components/layout/FormDrawer'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { sv } from '~/lib/i18n/sv'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { data: health } = useSuspenseQuery(convexQuery(api.health.get, {}))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">{sv.home.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {health.ok ? sv.home.healthOk : sv.home.healthError}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setDrawerOpen(true)}>{sv.home.openDrawer}</Button>
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            {sv.home.confirmDemo}
          </Button>
        </div>

        <FormDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title={sv.home.drawerTitle}
          description={sv.home.drawerDescription}
        >
          <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
            <div className="grid gap-2">
              <Label htmlFor="example-name">Namn</Label>
              <Input id="example-name" placeholder="Volvo XC60" />
            </div>
            <Button type="submit">{sv.common.close}</Button>
          </form>
        </FormDrawer>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={sv.home.confirmTitle}
          description={sv.home.confirmDescription}
          onConfirm={() => undefined}
        />
      </div>
    </AppShell>
  )
}
