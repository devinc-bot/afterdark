import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[28rem] max-w-full">
      <CardHeader>
        <CardTitle>Mesa de comedor Roble</CardTitle>
        <CardDescription>
          Madera maciza con acabado natural. Ideal para 6 comensales.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-[16px] text-ink-muted">$ 450.000 ARS</p>
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        <Button>Ver detalle</Button>
        <Button variant="outline">Consultar</Button>
      </CardFooter>
    </Card>
  ),
};
