import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrendingUp } from 'lucide-react'
import { BarChart } from './bar-chart'
import type { ChartConfig } from './chart'

const sampleData = [
  { month: 'Enero', desktop: 186, mobile: 80 },
  { month: 'Febrero', desktop: 305, mobile: 200 },
  { month: 'Marzo', desktop: 237, mobile: 120 },
  { month: 'Abril', desktop: 73, mobile: 190 },
  { month: 'Mayo', desktop: 209, mobile: 130 },
  { month: 'Junio', desktop: 214, mobile: 140 },
]

const singleSeriesConfig = {
  desktop: {
    label: 'Escritorio',
    color: 'var(--color-chart-1)',
  },
} satisfies ChartConfig

const multiSeriesConfig = {
  desktop: {
    label: 'Escritorio',
    color: 'var(--color-chart-1)',
  },
  mobile: {
    label: 'Móvil',
    color: 'var(--color-chart-2)',
  },
} satisfies ChartConfig

const meta = {
  title: 'UI/BarChart',
  component: BarChart,
  tags: ['autodocs'],
  args: {
    data: sampleData,
    config: singleSeriesConfig,
    categoryKey: 'month',
    title: 'Visitantes',
    description: 'Enero — Junio 2024',
    showLegend: false,
    showTooltip: true,
    series: ['desktop'],
    tickFormatter: (value: string) => value.slice(0, 3),
  },
} satisfies Meta<typeof BarChart>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithLegend: Story = {
  args: {
    config: multiSeriesConfig,
    series: ['desktop', 'mobile'],
    showLegend: true,
  },
}

export const Stacked: Story = {
  args: {
    config: multiSeriesConfig,
    series: ['desktop', 'mobile'],
    stacked: true,
    showLegend: true,
  },
}

export const WithFooter: Story = {
  args: {
    footer: (
      <>
        <div className="flex gap-2 font-medium leading-none">
          Subió 5.2% este mes <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando visitantes totales de los últimos 6 meses
        </div>
      </>
    ),
  },
}

export const WithoutCard: Story = {
  args: {
    withCard: false,
    title: undefined,
    description: undefined,
  },
}
