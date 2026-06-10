import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Label } from "./label";

const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select defaultValue="living">
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Elegir ambiente" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Ambientes</SelectLabel>
          <SelectItem value="living">Living</SelectItem>
          <SelectItem value="dormitorio">Dormitorio</SelectItem>
          <SelectItem value="comedor">Comedor</SelectItem>
          <SelectItem value="oficina">Oficina</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex w-[280px] flex-col gap-2">
      <Label htmlFor="category">Categoría</Label>
      <Select defaultValue="sillas">
        <SelectTrigger id="category">
          <SelectValue placeholder="Seleccionar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sillas">Sillas</SelectItem>
          <SelectItem value="mesas">Mesas</SelectItem>
          <SelectItem value="sofas">Sofás</SelectItem>
          <SelectItem value="escritorios">Escritorios</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
