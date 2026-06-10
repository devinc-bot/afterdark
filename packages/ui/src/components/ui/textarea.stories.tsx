import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";
import { Textarea } from "./textarea";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    error: { control: "text" },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

const fieldShellClassName = "w-96 max-w-full";

export const Default: Story = {
  render: (args) => (
    <div className={fieldShellClassName}>
      <Textarea {...args} />
    </div>
  ),
  args: {
    placeholder: "Describe la atmósfera y reglas del club…",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className={`flex flex-col gap-2 ${fieldShellClassName}`}>
      <Label htmlFor="additional-info" variant="field">
        Información adicional
      </Label>
      <Textarea id="additional-info" placeholder="Describe la atmósfera y reglas del club…" />
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className={fieldShellClassName}>
      <Textarea {...args} />
    </div>
  ),
  args: {
    disabled: true,
    placeholder: "No editable",
    value: "Texto fijo del campo.",
  },
};

export const DisabledWithLabel: Story = {
  render: () => (
    <div className={`flex flex-col gap-2 ${fieldShellClassName}`}>
      <Label htmlFor="disabled-info" variant="field">
        Información adicional
      </Label>
      <Textarea id="disabled-info" disabled value="Este campo no se puede editar." />
    </div>
  ),
};

export const WithError: Story = {
  render: (args) => (
    <div className={fieldShellClassName}>
      <Textarea {...args} />
    </div>
  ),
  args: {
    placeholder: "Describe la atmósfera y reglas del club…",
    error: "Este campo es obligatorio.",
  },
};

export const WithLabelAndError: Story = {
  render: () => (
    <div className={`flex flex-col gap-2 ${fieldShellClassName}`}>
      <Label htmlFor="error-info" variant="field">
        Información adicional
      </Label>
      <Textarea
        id="error-info"
        placeholder="Describe la atmósfera y reglas del club…"
        error="Ingresá al menos 20 caracteres."
      />
    </div>
  ),
};
