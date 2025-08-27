"use client";

import { useState } from 'react';
import RGL from "react-grid-layout";
import { toast } from 'sonner';
import { useDataStore } from '@/store/data-store'; 
import { KpiOperation } from '@/components/widgets/KpiCardWidget';
// Reexportando o tipo para ser usado no componente
export type { Layout } from 'react-grid-layout';

export type WidgetConfig = {
  id: string;
  title: string;
  type: 'kpi' | 'bar-chart' | 'pie-chart';
  x: number; y: number; w: number; h: number;
  kpiColumn?: string;
  kpiOperation?: KpiOperation;
  categoryColumn?: string;
};

interface UseDashboardBuilderProps {
  data: DataRow[];
}

type DataRow = { [key: string]: any };

export function useDashboardBuilder({ data }: UseDashboardBuilderProps) {
  // 1. Toda a lógica de estado vem para cá
  const { widgets, setWidgets } = useDataStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWidgetType, setNewWidgetType] = useState<'kpi' | 'bar-chart' | 'pie-chart' | ''>('');
  const [newWidgetColumn, setNewWidgetColumn] = useState('');
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newKpiOperation, setNewKpiOperation] = useState<KpiOperation>('count');
  const headers = Object.keys(data[0] || {});

  // 2. Todas as funções de manipulação vêm para cá
  const handleAddWidget = () => {
    // Validação agora inclui o título
    if (!newWidgetType || !newWidgetColumn || !newWidgetTitle.trim()) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

     const newWidget: WidgetConfig = {
      id: `widget_${Date.now()}`,
      type: newWidgetType,
      title: newWidgetTitle,
      x: (widgets.length * 4) % 12,
      y: Infinity,
      w: newWidgetType === 'bar-chart' ? 6 : (newWidgetType === 'pie-chart' ? 4 : 3), // Tamanho padrão
      h: 2, // Altura padrão para gráficos
      kpiColumn: newWidgetColumn,
      kpiOperation: newKpiOperation,
      categoryColumn: newWidgetColumn,
    };
    
    setWidgets([...widgets, newWidget]);
    
    // Resetar e fechar o dialog
    setIsDialogOpen(false);
    setNewWidgetType('');
    setNewWidgetColumn('');
    setNewWidgetTitle('');
    setNewKpiOperation('count');
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(widgets.filter(widget => widget.id !== widgetId));
    toast.success("Componente removido!");
  };

  const onLayoutChange = (layout: RGL.Layout[]) => {
    // Verificamos se houve mudança para evitar re-renderizações desnecessárias
    if (JSON.stringify(layout) === JSON.stringify(widgets.map(w => ({i: w.id, x: w.x, y: w.y, w: w.w, h: w.h})))) return;
    
    const updatedWidgets = widgets.map(widget => {
      const layoutItem = layout.find(l => l.i === widget.id);
      if (layoutItem) {
        return { ...widget, x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h };
      }
      return widget;
    });
    setWidgets(updatedWidgets);
  };

  // 3. O hook retorna tudo que o componente precisa para renderizar
  return {
    widgets,
    isDialogOpen,
    setIsDialogOpen,
    newWidgetType,
    setNewWidgetType,
    newWidgetColumn,
    setNewWidgetColumn,
    newWidgetTitle,
    setNewWidgetTitle,
    newKpiOperation,
    setNewKpiOperation,
    headers,
    handleAddWidget,
    handleRemoveWidget,
    onLayoutChange,
    
  };
}