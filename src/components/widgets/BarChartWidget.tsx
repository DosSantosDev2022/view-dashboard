"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';

type DataRow = { [key: string]: any };

interface BarChartWidgetProps {
  title: string;
  data: DataRow[];
  category: string; // Coluna para o eixo X (categorias)
}

export function BarChartWidget({ title, data, category }: BarChartWidgetProps) {

  // Processamos os dados para agrupar e contar as ocorrências de cada categoria.
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Usamos um Map para contar as ocorrências de cada valor na coluna de categoria
    const counts = data.reduce((acc, row) => {
      const key = row[category] ?? 'Vazio'; // Pega o valor da categoria
      acc.set(key, (acc.get(key) || 0) + 1); // Incrementa a contagem
      return acc;
    }, new Map<string, number>());

    // Converte o Map para o formato que o Recharts espera: [{ name: '...', value: ... }]
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));

  }, [data, category]);

  return (
    <Card className="md:col-span-2"> {/* Faz o gráfico ocupar mais espaço */}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={processedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                cursor={{fill: 'rgba(200, 200, 200, 0.2)'}}
                formatter={(value) => [`${value} ocorrências`, 'Contagem']}
              />
              <Bar dataKey="value" fill="#8884d8" name="Contagem" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}