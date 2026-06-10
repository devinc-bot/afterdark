import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/properties/')({
  component: PropertiesPage,
})

function PropertiesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold">Propiedades</h1>
    </main>
  )
}
