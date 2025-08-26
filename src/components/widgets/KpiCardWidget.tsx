"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

// Tipos de dados que o componente espera receber
type DataRow = { [key: string]: any };

interface KpiCardWidgetProps {
  title: string;
  data: DataRow[];
  column: string;
  operation: 'count' | 'sum'; // A operação a ser realizada
}

export function KpiCardWidget({ title, data, column, operation }: KpiCardWidgetProps) {
  
  // Usamos useMemo para calcular o valor apenas uma vez, otimizando a performance.
  // O cálculo só é refeito se os dados, a coluna ou a operação mudarem.
  const calculatedValue = useMemo(() => {
    if (!data || data.length === 0) {
      return 0;
    }

    switch (operation) {
      case 'count':
        // Simplesmente conta o número de linhas
        return data.length;
      case 'sum':
        // Soma os valores de uma coluna específica
        return data.reduce((total, row) => {
          const value = parseFloat(row[column]);
          return total + (isNaN(value) ? 0 : value);
        }, 0);
      default:
        return 0;
    }
  }, [data, column, operation]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">
          {/* Formata o número para o padrão brasileiro */}
          {calculatedValue.toLocaleString('pt-BR')}
        </p>
      </CardContent>
    </Card>
  );
}