"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

// Component for bar charts
const ChartBars = React.forwardRef<
  any,
  React.ComponentProps<typeof RechartsPrimitive.BarChart> & {
    data: any[]
    categories: Array<{
      name: string
      dataKey: string
    }>
    dataKey: string
    xAxis?: ("dataKey" | "value")[]
    yAxis?: ("left" | "right")[]
    layout?: "horizontal" | "vertical"
  }
>(
  (
    {
      data,
      categories,
      dataKey,
      xAxis = ["dataKey"],
      yAxis = ["left"],
      layout = "horizontal",
      ...props
    },
    ref
  ) => {
    const { config } = useChart()
    const vertical = layout === "vertical"

    return (
      <RechartsPrimitive.BarChart
        data={data}
        layout={layout}
        ref={ref}
        {...props}
      >
        <RechartsPrimitive.CartesianGrid vertical={!vertical} horizontal={vertical} />
        
        {vertical
          ? yAxis.includes("left") && (
              <RechartsPrimitive.YAxis
                dataKey={dataKey}
                type="category"
                axisLine={false}
                tickLine={false}
              />
            )
          : xAxis.includes("dataKey") && (
              <RechartsPrimitive.XAxis
                dataKey={dataKey}
                axisLine={false}
                tickLine={false}
              />
            )}
        
        {vertical
          ? xAxis.includes("value") && (
              <RechartsPrimitive.XAxis axisLine={false} tickLine={false} />
            )
          : yAxis.includes("left") && (
              <RechartsPrimitive.YAxis
                yAxisId="left"
                orientation="left"
                axisLine={false}
                tickLine={false}
              />
            )}
        
        {yAxis.includes("right") && !vertical && (
          <RechartsPrimitive.YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
          />
        )}
        
        <RechartsPrimitive.Tooltip content={<ChartTooltipContent />} />
        
        {categories.map(({ name, dataKey: key }, i) => (
          <RechartsPrimitive.Bar
            key={`${name}-${i}`}
            dataKey={key}
            name={name}
            fill={`var(--color-${name}, currentColor)`}
            stroke={`var(--color-${name}, currentColor)`}
            yAxisId={vertical ? undefined : yAxis.includes("right") ? "right" : "left"}
            radius={[4, 4, 0, 0]}
            {...(vertical && { barSize: 24 })}
          />
        ))}
      </RechartsPrimitive.BarChart>
    )
  }
)
ChartBars.displayName = "ChartBars"

// Component for line charts
const ChartLine = React.forwardRef<
  any,
  React.ComponentProps<typeof RechartsPrimitive.LineChart> & {
    data: any[]
    categories: Array<{
      name: string
      dataKey: string
    }>
    dataKey: string
    xAxis?: ("dataKey" | "value")[]
    yAxis?: ("left" | "right")[]
  }
>(
  (
    { data, categories, dataKey, xAxis = ["dataKey"], yAxis = ["left"], ...props },
    ref
  ) => {
    const { config } = useChart()

    return (
      <RechartsPrimitive.LineChart data={data} ref={ref} {...props}>
        <RechartsPrimitive.CartesianGrid vertical={false} />
        
        {xAxis.includes("dataKey") && (
          <RechartsPrimitive.XAxis
            dataKey={dataKey}
            axisLine={false}
            tickLine={false}
          />
        )}
        
        {yAxis.includes("left") && (
          <RechartsPrimitive.YAxis
            yAxisId="left"
            orientation="left"
            axisLine={false}
            tickLine={false}
          />
        )}
        
        {yAxis.includes("right") && (
          <RechartsPrimitive.YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
          />
        )}
        
        <RechartsPrimitive.Tooltip content={<ChartTooltipContent />} />
        
        {categories.map(({ name, dataKey: key }, i) => (
          <RechartsPrimitive.Line
            key={`${name}-${i}`}
            type="monotone"
            dataKey={key}
            name={name}
            stroke={`var(--color-${name}, currentColor)`}
            activeDot={{ r: 6, fill: `var(--color-${name}, currentColor)` }}
            yAxisId={yAxis.includes("right") ? "right" : "left"}
          />
        ))}
      </RechartsPrimitive.LineChart>
    )
  }
)
ChartLine.displayName = "ChartLine"

// Component for pie charts
const ChartPie = React.forwardRef<
  any,
  React.ComponentProps<typeof RechartsPrimitive.PieChart> & {
    data: any[]
    nameKey: string
    dataKey: string
    innerRadius?: number
    outerRadius?: number
    paddingAngle?: number
  }
>(
  (
    { data, nameKey, dataKey, innerRadius = 0, outerRadius = 100, paddingAngle = 2, ...props },
    ref
  ) => {
    const { config } = useChart()

    return (
      <RechartsPrimitive.PieChart ref={ref} {...props}>
        <RechartsPrimitive.Pie
          data={data}
          nameKey={nameKey}
          dataKey={dataKey}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={paddingAngle}
          fill="var(--color-value, currentColor)"
          stroke="var(--bg-card)"
          labelLine={false}
        >
          {data.map((entry, i) => (
            <RechartsPrimitive.Cell
              key={`cell-${i}`}
              fill={`hsl(${(i * 40) % 360}, 80%, 60%)`}
            />
          ))}
        </RechartsPrimitive.Pie>
        <RechartsPrimitive.Tooltip content={<ChartTooltipContent />} />
      </RechartsPrimitive.PieChart>
    )
  }
)
ChartPie.displayName = "ChartPie"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartBars,
  ChartLine,
  ChartPie
}
