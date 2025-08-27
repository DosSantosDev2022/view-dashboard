"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  LabelList,
} from "recharts";
import { Button } from "../ui";
import { Palette, X } from "lucide-react";
import { TooltipContent, TooltipTrigger, Tooltip } from "../ui/tooltip";
import { useBarChartWidget } from "@/hooks/useBarChartWidget";

type DataRow = { [key: string]: any };

interface BarChartWidgetProps {
  title: string;
  data: DataRow[];
  category: string;
  widgetId: string; // Adicionamos para identificar o widget
  onRemove: (id: string) => void; // Adicionamos a função de remover
}
export function BarChartWidget({
  title,
  data,
  category,
  widgetId,
  onRemove,
}: BarChartWidgetProps) {
  const { processedData, colorIndex, handleChangeColor, tickFormatter } =
    useBarChartWidget({ data, category });

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium truncate">
            {title}
          </CardTitle>
          <div className="flex">
            {/* Botão de cor que já tínhamos */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={handleChangeColor}
                  className="h-7 w-7"
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Alterar cor</TooltipContent>
            </Tooltip>
            {/* Botão de Remover */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => onRemove(widgetId)}
                  className="h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remover componente</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>

      {/* A CORREÇÃO FINAL DE LAYOUT ESTÁ AQUI */}
      <CardContent className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            margin={{
              top: 20,
              right: 5,
              left: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              stroke="var(--foreground)"
              tick={{ fontSize: 12 }}
              tickFormatter={tickFormatter}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <RechartsTooltip
              cursor={{ fill: "var(--muted)" }}
              formatter={(value) => [`${value} itens`, "Contagem"]}
              itemStyle={{
                color: "var(--foreground)",
                fontSize: "12px",
              }}
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                boxShadow: "var(--shadow)",
              }}
              labelStyle={{
                color: "var(--foreground)",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            />
            <Bar
              dataKey="value"
              fill={`var(--chart-${colorIndex})`}
              name="Contagem"
              radius={[4, 4, 0, 0]}
            >
              <LabelList
                dataKey="value"
                position="top"
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  fill: "var(--foreground)",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
