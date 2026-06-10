import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/properties/new')({
  component: NewPropertyPage,
})

function NewPropertyPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold">Nueva propiedad</h1>
    </main>
  )
}
