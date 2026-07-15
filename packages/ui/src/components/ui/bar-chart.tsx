'use client'

import * as React from 'react'
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { cn } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from './chart'

const DEFAULT_CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
] as const

export type BarChartDataPoint = Record<string, string | number | null | undefined>

export type BarChartProps = {
  data: BarChartDataPoint[]
  /** Series definition: keys match `data` fields and drive colors/labels. */
  config: ChartConfig
  /** Category axis key (e.g. `month`). */
  categoryKey: string
  /** Series keys to draw. Defaults to `Object.keys(config)`. */
  series?: string[]
  title?: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  showLegend?: boolean
  showTooltip?: boolean
  showGrid?: boolean
  showYAxis?: boolean
  /** Force integer Y ticks (useful for counts). */
  yAxisAllowDecimals?: boolean
  /** Wrap in Card (default). Set false to render only the chart. */
  withCard?: boolean
  stacked?: boolean
  barRadius?: number
  tickFormatter?: (value: string) => string
  /** Recharts XAxis interval. Use a number to thin dense day axes. */
  xAxisInterval?: number | 'preserveStartEnd'
  /** Min gap between X ticks in px (Recharts). */
  xAxisMinTickGap?: number
  className?: string
  chartClassName?: string
  accessibilityLayer?: boolean
}

function resolveSeriesColors(config: ChartConfig): ChartConfig {
  const entries = Object.entries(config)
  return Object.fromEntries(
    entries.map(([key, value], index) => {
      if (value.color || value.theme) {
        return [key, value]
      }
      return [
        key,
        {
          ...value,
          color: DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length],
        },
      ]
    })
  )
}

function BarChart({
  data,
  config,
  categoryKey,
  series,
  title,
  description,
  footer,
  showLegend = false,
  showTooltip = true,
  showGrid = true,
  showYAxis = false,
  yAxisAllowDecimals = true,
  withCard = true,
  stacked = false,
  barRadius = 8,
  tickFormatter,
  xAxisInterval = 0,
  xAxisMinTickGap,
  className,
  chartClassName,
  accessibilityLayer = true,
}: BarChartProps) {
  const resolvedConfig = React.useMemo(() => resolveSeriesColors(config), [config])
  const seriesKeys = series ?? Object.keys(resolvedConfig)

  const chart = (
    <ChartContainer config={resolvedConfig} className={cn('w-full', chartClassName)}>
      <RechartsBarChart accessibilityLayer={accessibilityLayer} data={data}>
        {showGrid ? <CartesianGrid vertical={false} /> : null}
        <XAxis
          dataKey={categoryKey}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          interval={xAxisInterval}
          minTickGap={xAxisMinTickGap}
          tickFormatter={tickFormatter}
        />
        {showYAxis ? (
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={36}
            allowDecimals={yAxisAllowDecimals}
          />
        ) : null}
        {showTooltip ? (
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
        ) : null}
        {showLegend ? <ChartLegend content={<ChartLegendContent />} /> : null}
        {seriesKeys.map((dataKey) => (
          <Bar
            key={dataKey}
            dataKey={dataKey}
            fill={`var(--color-${dataKey})`}
            radius={barRadius}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  )

  if (!withCard) {
    return <div className={className}>{chart}</div>
  }

  const hasHeader =
    (title !== null && title !== undefined) || (description !== null && description !== undefined)

  return (
    <Card className={className}>
      {hasHeader ? (
        <CardHeader>
          {title !== null && title !== undefined ? <CardTitle>{title}</CardTitle> : null}
          {description !== null && description !== undefined ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
      ) : null}
      <CardContent>{chart}</CardContent>
      {footer !== null && footer !== undefined ? (
        <CardFooter className="flex-col items-start gap-2 text-sm">{footer}</CardFooter>
      ) : null}
    </Card>
  )
}

export { BarChart, type ChartConfig }
