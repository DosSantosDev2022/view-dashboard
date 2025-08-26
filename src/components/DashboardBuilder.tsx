"use client";

import { useState } from 'react';
// Importações do DND Kit
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';

// O resto das importações
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Importando nossos componentes de widget
import { KpiCardWidget } from './widgets/KpiCardWidget';
import { BarChartWidget } from './widgets/BarChartWidget';
import { SortableWidget } from './widgets/SortableWidget';
import { toast } from 'sonner';

type DataRow = { [key: string]: any };

// Definindo a "receita" de um widget
export type WidgetConfig = {
  id: string;
  title: string;
  type: 'kpi' | 'bar-chart';
  // Props para KPI
  kpiColumn?: string;
  kpiOperation?: 'count' | 'sum';
  // Props para Gráfico de Barras
  barChartCategory?: string;
};

interface DashboardBuilderProps {
  data: DataRow[];
  onReset: () => void;
}

export function DashboardBuilder({ data, onReset }: DashboardBuilderProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWidgetType, setNewWidgetType] = useState<'kpi' | 'bar-chart' | ''>('');
  const [newWidgetColumn, setNewWidgetColumn] = useState('');
  const headers = Object.keys(data[0] || {});

  const handleAddWidget = () => {
    if (!newWidgetType || !newWidgetColumn) {
      toast.error("Por favor, selecione o tipo e a coluna.");
      return;
    }

    const newWidget: WidgetConfig = {
      id: `widget_${Date.now()}`,
      type: newWidgetType,
      title: `Contagem de ${newWidgetColumn}`, // Título simples por enquanto
      // Configs específicas
      kpiColumn: newWidgetColumn,
      kpiOperation: 'count', // Por enquanto, só contagem
      barChartCategory: newWidgetColumn,
    };
    
    setWidgets(prev => [...prev, newWidget]);
    // Resetar e fechar o dialog
    setIsDialogOpen(false);
    setNewWidgetType('');
    setNewWidgetColumn('');
  };

  // Função para lidar com o fim do arrasto (drag)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        // Usa a função `arrayMove` para criar um novo array com a ordem correta
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

   const handleRemoveWidget = (widgetId: string) => {
    setWidgets((prevWidgets) => prevWidgets.filter(widget => widget.id !== widgetId));
    toast.success("Componente removido com sucesso!");
  };

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Construtor de Dashboard</h1>
          <p className="text-gray-500">Adicione e organize os componentes para visualizar seus dados.</p>
        </div>
        <div className="flex gap-2">
          {/* Botão para abrir o Dialog de Adicionar Componente */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Adicionar Componente</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Novo Componente</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="widget-type" className="text-right">Tipo</Label>
                  <Select onValueChange={(value: any) => setNewWidgetType(value)}>
                    <SelectTrigger className="col-span-3 w-full"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kpi">Cartão de KPI (Contagem)</SelectItem>
                      <SelectItem value="bar-chart">Gráfico de Barras (Contagem)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="widget-column" className="text-right">Coluna</Label>
                   <Select onValueChange={(value) => setNewWidgetColumn(value)}>
                    <SelectTrigger className="col-span-3 w-full"><SelectValue placeholder="Selecione a coluna" /></SelectTrigger>
                    <SelectContent>
                      {headers.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddWidget}>Adicionar ao Painel</Button>
            </DialogContent>
          </Dialog>

          <Button onClick={onReset} variant="outline">Carregar Novo Arquivo</Button>
        </div>
      </div>

      {/* Área onde os widgets do dashboard são renderizados com Drag-and-Drop */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgets.map(w => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Renderização dinâmica dos widgets arrastáveis */}
            {widgets.map(widget => (
              <SortableWidget 
              key={widget.id} 
              id={widget.id}
              onRemove={handleRemoveWidget}
              >
                {widget.type === 'kpi' && widget.kpiColumn && widget.kpiOperation && (
                  <KpiCardWidget title={widget.title} data={data} column={widget.kpiColumn} operation={widget.kpiOperation} />
                )}
                {widget.type === 'bar-chart' && widget.barChartCategory && (
                  <BarChartWidget title={widget.title} data={data} category={widget.barChartCategory} />
                )}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </main>
  );
}