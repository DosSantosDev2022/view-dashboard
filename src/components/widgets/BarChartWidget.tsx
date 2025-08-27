"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Button } from "../ui";
import { Palette, X } from "lucide-react";
import { TooltipContent, TooltipTrigger, Tooltip } from "../ui/tooltip";

type DataRow = { [key: string]: any };

interface BarChartWidgetProps {
  title: string;
  data: DataRow[];
  category: string;
  widgetId: string; // Adicionamos para identificar o widget
  onRemove: (id: string) => void; // Adicionamos a função de remover
}

type ChartData = {
  name: string;
  value: number;
};

const MONTH_ORDER_MAP: { [key: string]: number } = {
  JANEIRO: 1,
  JAN: 1,
  FEVEREIRO: 2,
  FEV: 2,
  MARÇO: 3,
  MARCO: 3,
  MAR: 3,
  ABRIL: 4,
  ABR: 4,
  MAIO: 5,
  MAI: 5,
  JUNHO: 6,
  JUN: 6,
  JULHO: 7,
  JUL: 7,
  AGOSTO: 8,
  AGO: 8,
  SETEMBRO: 9,
  SET: 9,
  OUTUBRO: 10,
  OUT: 10,
  NOVEMBRO: 11,
  NOV: 11,
  DEZEMBRO: 12,
  DEZ: 12,
};

export function BarChartWidget({
  title,
  data,
  category,
  widgetId,
  onRemove,
}: BarChartWidgetProps) {
  const [colorIndex, setColorIndex] = useState(1);
  // A lógica de processamento de dados agora inclui a ordenação inteligente.
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // A contagem de ocorrências permanece a mesma
    const counts = data.reduce((acc, row) => {
      const key = row[category] ?? "Vazio";
      acc.set(key, (acc.get(key) || 0) + 1);
      return acc;
    }, new Map<string, number>());

    // Converte o Map para o formato que o Recharts espera
    const entriesArray: [string, number][] = Array.from(counts.entries());
    let chartData: ChartData[] = entriesArray.map(
      ([name, value]): ChartData => ({ name, value }),
    );

    // =========================================================
    // 2. Lógica de Detecção e Ordenação
    // =========================================================
    // Verifica se a maioria das categorias são meses conhecidos
    const categoryNames = Array.from(counts.keys());
    const monthMatches = categoryNames.filter(
      (name) => MONTH_ORDER_MAP[String(name).toUpperCase()],
    ).length;
    const isMonthData = monthMatches > categoryNames.length / 2;

    if (isMonthData) {
      // Se for data de meses, ordena cronologicamente
      chartData.sort((a, b) => {
        const monthA = MONTH_ORDER_MAP[String(a.name).toUpperCase()];
        const monthB = MONTH_ORDER_MAP[String(b.name).toUpperCase()];
        return monthA - monthB;
      });
    } else {
      // Como um bônus, para dados que não são meses, vamos ordenar por valor (do maior para o menor)
      chartData.sort((a, b) => b.value - a.value);
    }

    return chartData;
  }, [data, category]);

  const handleChangeColor = () => {
    // Lógica para ciclar do 1 ao 5: (1->2, 2->3, 3->4, 4->5, 5->1)
    setColorIndex((prevIndex) => (prevIndex % 5) + 1);
  };

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
      <CardContent className="flex-grow pt-2 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
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
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
