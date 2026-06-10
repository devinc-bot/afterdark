import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, ShoppingCart, Zap } from "lucide-react";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "inverse", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Comprar ahora",
  },
};

export const WithIconLeft: Story = {
  args: {
    children: "Crear cuenta",
    iconLeft: <Zap aria-hidden="true" />,
  },
};

export const WithIconRight: Story = {
  args: {
    variant: "outline",
    children: "Ver catálogo",
    iconRight: <ArrowRight aria-hidden="true" />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: "Agregar al carrito",
    iconLeft: <ShoppingCart aria-hidden="true" />,
    iconRight: <ArrowRight aria-hidden="true" />,
  },
};

export const Loading: Story = {
  args: {
    children: "Procesando…",
    loading: true,
  },
};

export const LoadingWithIcon: Story = {
  args: {
    children: "Crear cuenta",
    iconLeft: <Zap aria-hidden="true" />,
    loading: true,
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Ver catálogo",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Eliminar",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Cancelar",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Pequeño",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Deshabilitado",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="inverse">Inverse</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const IconAndLoadingStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button iconLeft={<Zap aria-hidden="true" />}>Crear cuenta</Button>
        <Button variant="outline" iconRight={<ArrowRight aria-hidden="true" />}>
          Continuar
        </Button>
        <Button loading>Procesando…</Button>
        <Button loading iconLeft={<Zap aria-hidden="true" />}>
          Crear cuenta
        </Button>
      </div>
    </div>
  ),
};
