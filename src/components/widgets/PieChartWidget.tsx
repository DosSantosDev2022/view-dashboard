"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X } from "lucide-react";
import { usePieChartWidget } from "@/hooks/usePieChartWidget";
import { useMemo } from "react";

type DataRow = { [key: string]: any };

interface PieChartWidgetProps {
  title: string;
  data: DataRow[];
  category: string;
  widgetId: string;
  onRemove: (id: string) => void;
}

// Componente para o Tooltip customizado
const CustomTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-bold">{`${data.name}`}</p>
        <p className="text-sm text-muted-foreground">{`Contagem: ${data.value} (${percent}%)`}</p>
      </div>
    );
  }
  return null;
};

// ===================================================================
// 1. Função para renderizar o rótulo (label) customizado
// ===================================================================
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5; // Posição no meio da fatia
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Não mostra o label se a fatia for muito pequena
  if (percent < 0.05) {
    return null;
  }

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function PieChartWidget({
  title,
  data,
  category,
  widgetId,
  onRemove,
}: PieChartWidgetProps) {
  const { processedData, CHART_COLORS } = usePieChartWidget({ data, category });

  // Calculamos o total de todos os valores para passar para o tooltip
  const totalValue = useMemo(() => {
    return processedData.reduce((sum, entry) => sum + entry.value, 0);
  }, [processedData]);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium truncate">
            {title}
          </CardTitle>
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
      </CardHeader>

      <CardContent className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <RechartsTooltip content={<CustomTooltip total={totalValue} />} />
            <Legend wrapperStyle={{ fontSize: "14px" }} />
            <Pie
              data={processedData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {processedData.map((entry, index) => (
                <Cell
                  key={`cell-${
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    index
                  }`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
