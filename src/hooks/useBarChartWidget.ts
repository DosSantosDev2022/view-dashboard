"use client";

import { useMemo, useState } from "react";

// Tipos que serão usados tanto no hook quanto no componente
type DataRow = { [key: string]: any };
type ChartData = { name: string; value: number };

// Propriedades que o hook espera receber
interface UseBarChartWidgetProps {
  data: DataRow[];
  category: string;
}

// O mapa de meses é uma constante que pode viver aqui
const MONTH_ORDER_MAP: { [key: string]: number } = {
  JANEIRO: 1, JAN: 1, FEVEREIRO: 2, FEV: 2, MARÇO: 3, MARCO: 3, MAR: 3,
  ABRIL: 4, ABR: 4, MAIO: 5, MAI: 5, JUNHO: 6, JUN: 6,
  JULHO: 7, JUL: 7, AGOSTO: 8, AGO: 8, SETEMBRO: 9, SET: 9,
  OUTUBRO: 10, OUT: 10, NOVEMBRO: 11, NOV: 11, DEZEMBRO: 12, DEZ: 12,
};

export function useBarChartWidget({ data, category }: UseBarChartWidgetProps) {
  // 1. O estado da cor agora vive no hook
  const [colorIndex, setColorIndex] = useState(1);

  // 2. Toda a lógica de processamento de dados está aqui
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const counts = data.reduce((acc, row) => {
      const key = row[category] ?? "Vazio";
      acc.set(String(key), (acc.get(String(key)) || 0) + 1);
      return acc;
    }, new Map<string, number>());

    const entriesArray: [string, number][] = Array.from(counts.entries());
    let chartData: ChartData[] = entriesArray.map(
      ([name, value]): ChartData => ({ name, value }),
    );

    const categoryNames = Array.from(counts.keys());
    const monthMatches = categoryNames.filter(
      (name) => MONTH_ORDER_MAP[String(name).toUpperCase()],
    ).length;
    const isMonthData = monthMatches > categoryNames.length / 2;

    if (isMonthData) {
      chartData.sort((a, b) => {
        const monthA = MONTH_ORDER_MAP[String(a.name).toUpperCase()] || 0;
        const monthB = MONTH_ORDER_MAP[String(b.name).toUpperCase()] || 0;
        return monthA - monthB;
      });
    } else {
      chartData.sort((a, b) => b.value - a.value);
    }

    return chartData;
  }, [data, category]);

  // 3. As funções de manipulação também estão no hook
  const handleChangeColor = () => {
    setColorIndex((prevIndex) => (prevIndex % 5) + 1);
  };
  
  // 4. Podemos até mover a lógica de formatação do 'tick' para cá
  const tickFormatter = (value: string) => {
    const upperValue = value.toUpperCase();
    return MONTH_ORDER_MAP[upperValue] && upperValue.length === 3 
      ? value 
      : value.slice(0, 10);
  };

  // 5. O hook retorna tudo que o componente precisa
  return {
    processedData,
    colorIndex,
    handleChangeColor,
    tickFormatter,
  };
}