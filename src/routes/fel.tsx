import { createFileRoute } from '@tanstack/react-router'
import { ErrorPageContent } from '~/components/layout/ErrorPageContent'

export const Route = createFileRoute('/fel')({
  component: FelPage,
})

function FelPage() {
  return <ErrorPageContent />
}
