"use client";

import { useMemo } from "react";

type DataRow = { [key: string]: any };
type ChartData = { name: string; value: number };

interface UsePieChartWidgetProps {
  data: DataRow[];
  category: string;
}

// 1. Definimos uma paleta de cores usando nossas variáveis CSS
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function usePieChartWidget({ data, category }: UsePieChartWidgetProps) {
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // A lógica de contagem é a mesma do gráfico de barras
    const counts = data.reduce((acc, row) => {
      const key = row[category] ?? "Vazio";
      acc.set(String(key), (acc.get(String(key)) || 0) + 1);
      return acc;
    }, new Map<string, number>());
    
    // 1. Criamos um array intermediário com um tipo explícito.
    const entriesArray: [string, number][] = Array.from(counts.entries());

    // 2. Agora, o .map() é chamado em um array com um tipo bem definido.
    const chartData: ChartData[] = entriesArray.map(
      ([name, value]): ChartData => ({ name, value })
    );
    // ===================================================================

    // Ordena do maior para o menor para um visual mais agradável
    chartData.sort((a, b) => b.value - a.value);
    
    return chartData;
  }, [data, category]);
  
  // 2. O hook retorna os dados processados e a nossa paleta de cores
  return {
    processedData,
    CHART_COLORS,
  };
}