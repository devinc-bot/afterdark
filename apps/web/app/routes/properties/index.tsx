import { createFileRoute } from "@tanstack/react-router";
import { filterPropertySchema } from "@afterdark/validators";

export const Route = createFileRoute("/properties/")({
  validateSearch: (search) => filterPropertySchema.parse(search),
  component: PropertiesPage,
});

function PropertiesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold">Propiedades</h1>
    </main>
  );
}
