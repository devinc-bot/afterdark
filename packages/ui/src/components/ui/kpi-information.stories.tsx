import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertTriangle, Banknote, Martini, TrendingUp } from 'lucide-react'
import { KpiInformation } from './kpi-information'

const meta = {
  title: 'UI/KpiInformation',
  component: KpiInformation,
  tags: ['autodocs'],
  args: {
    label: 'Label',
    value: '0',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'warning'],
    },
    label: { control: 'text' },
    value: { control: 'text' },
  },
} satisfies Meta<typeof KpiInformation>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Total Clubs',
    value: '24',
    subtext: (
      <>
        <TrendingUp aria-hidden="true" />
        +3 this month
      </>
    ),
  },
}

export const WithIcon: Story = {
  args: {
    label: 'Total Inventory Value',
    value: '$42,850',
    subtext: (
      <>
        <TrendingUp aria-hidden="true" />
        +12% vs last week
      </>
    ),
    icon: <Banknote aria-hidden="true" />,
  },
}

export const Primary: Story = {
  args: {
    variant: 'primary',
    label: 'Top Selling Drink',
    value: 'Electric Mule',
    subtext: '142 orders tonight',
    icon: <Martini aria-hidden="true" />,
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    label: 'Low Stock Alerts',
    value: '8 Items',
    subtext: 'Action required immediately',
    icon: <AlertTriangle aria-hidden="true" />,
  },
}

export const DashboardRow: Story = {
  render: () => (
    <div className="grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
      <KpiInformation
        label="Total Inventory Value"
        value="$42,850"
        subtext={
          <>
            <TrendingUp aria-hidden="true" />
            +12% vs last week
          </>
        }
        icon={<Banknote aria-hidden="true" />}
      />
      <KpiInformation
        variant="primary"
        label="Top Selling Drink"
        value="Electric Mule"
        subtext="142 orders tonight"
        icon={<Martini aria-hidden="true" />}
      />
      <KpiInformation
        variant="warning"
        label="Low Stock Alerts"
        value="8 Items"
        subtext="Action required immediately"
        icon={<AlertTriangle aria-hidden="true" />}
      />
    </div>
  ),
}
