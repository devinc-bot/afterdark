import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold">afterdark</h1>
      <p className="mt-2 text-muted-foreground">Plataforma de eventos nocturnos</p>
    </main>
  )
}
