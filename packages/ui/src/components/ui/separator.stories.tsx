import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./separator";

const meta = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <div>
        <p className="text-sm font-medium">Sección superior</p>
        <p className="text-sm text-ink-muted">Contenido de ejemplo.</p>
      </div>
      <Separator />
      <div>
        <p className="text-sm font-medium">Sección inferior</p>
        <p className="text-sm text-ink-muted">Más contenido de ejemplo.</p>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-20 items-center gap-4">
      <span className="text-sm">Izquierda</span>
      <Separator orientation="vertical" className="h-full" />
      <span className="text-sm">Derecha</span>
    </div>
  ),
};
