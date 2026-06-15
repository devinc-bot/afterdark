import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/properties/$id/edit')({
  component: EditPropertyPage,
})

function EditPropertyPage() {
  const { id } = Route.useParams()
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold">Editar propiedad</h1>
      <p className="text-muted-foreground">{id}</p>
    </main>
  )
}
