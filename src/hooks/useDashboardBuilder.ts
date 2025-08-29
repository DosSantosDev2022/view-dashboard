"use client";

import { useEffect, useMemo, useState } from 'react';
import ReactGridLayoutLibrary from "react-grid-layout";
import { toast } from 'sonner';
import { useDataStore } from '@/store/data-store'; 
import { KpiOperation } from '@/components/widgets/KpiCardWidget';

// Reexportando o tipo para ser usado no componente
export type { Layout } from 'react-grid-layout';

// Tipos de dados
type DataRow = { [key: string]: any };

export type WidgetConfiguration = {
  id: string;
  title: string;
  type: 'kpi' | 'bar-chart' | 'pie-chart';
  positionX: number; // 'x' renomeado para 'positionX'
  positionY: number; // 'y' renomeado para 'positionY'
  width: number;     // 'w' renomeado para 'width'
  height: number;    // 'h' renomeado para 'height'
  kpiColumn?: string;
  kpiOperation?: KpiOperation;
  categoryColumn?: string;
};

interface UseDashboardBuilderParameters {
  data: DataRow[];
}

export function useDashboardBuilder({ data }: UseDashboardBuilderParameters) {
  // --- Estados do Zustand ---
  const { widgets, setWidgets } = useDataStore();

  // --- Estados do Formulário de Criação de Widget ---
  const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false);
  const [newWidgetType, setNewWidgetType] = useState<'kpi' | 'bar-chart' | 'pie-chart' | ''>('');
  const [newWidgetColumn, setNewWidgetColumn] = useState('');
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newKpiOperation, setNewKpiOperation] = useState<KpiOperation>('count');
  
  // --- Estados para Configuração de Filtros ---
  const [filterableColumns, setFilterableColumns] = useState<string[]>([]);
  
  // --- Estados do Filtro Global Ativo ---
  const [globalFilterColumn, setGlobalFilterColumn] = useState<string>("");
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  // --- Dados Derivados e Memoizados ---
  const availableColumnHeaders = useMemo(() => (data.length > 0 ? Object.keys(data[0]) : []), [data]);

  const uniqueGlobalColumnValues = useMemo(() => {
    if (!globalFilterColumn || data.length === 0) return [];
    const uniqueValues = new Set(data.map(row => row[globalFilterColumn]));
    return Array.from(uniqueValues).filter(value => value !== null && value !== undefined);
  }, [data, globalFilterColumn]);

  const filteredData = useMemo(() => {
    if (globalFilterColumn && globalFilterValue) {
      return data.filter(
        (row) => String(row[globalFilterColumn]) === globalFilterValue
      );
    }
    return data;
  }, [data, globalFilterColumn, globalFilterValue]);

  // --- Efeitos Colaterais (Side Effects) ---
  useEffect(() => {
    // Reseta o valor selecionado se a coluna do filtro for alterada
    setGlobalFilterValue("");
  }, [globalFilterColumn]);
  
  useEffect(() => {
    // Reseta o filtro global se a coluna selecionada for desmarcada da lista de colunas filtráveis
    if (globalFilterColumn && !filterableColumns.includes(globalFilterColumn)) {
      setGlobalFilterColumn("");
    }
  }, [filterableColumns, globalFilterColumn]);


  // --- Funções de Manipulação de Eventos (Handlers) ---
  const handleAddWidget = () => {
    if (!newWidgetType || !newWidgetColumn || !newWidgetTitle.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const newWidget: WidgetConfiguration = {
      id: `widget_${Date.now()}`,
      type: newWidgetType,
      title: newWidgetTitle,
      positionX: (widgets.length * 4) % 12,
      positionY: Infinity, // A biblioteca posiciona no primeiro espaço livre
      width: newWidgetType === 'bar-chart' ? 6 : (newWidgetType === 'pie-chart' ? 4 : 3),
      height: 2,
      kpiColumn: newWidgetColumn,
      kpiOperation: newKpiOperation,
      categoryColumn: newWidgetColumn,
    };
    
    setWidgets([...widgets, newWidget]);
    
    // Resetar estado do formulário e fechar o dialog
    setIsCreationDialogOpen(false);
    setNewWidgetType('');
    setNewWidgetColumn('');
    setNewWidgetTitle('');
    setNewKpiOperation('count');
  };

  const handleRemoveWidget = (widgetIdToRemove: string) => {
    setWidgets(widgets.filter(widget => widget.id !== widgetIdToRemove));
    toast.success("Componente removido com sucesso!");
  };

  const handleLayoutChange = (newLayout: ReactGridLayoutLibrary.Layout[]) => {
    const updatedWidgets = widgets.map(widget => {
      const layoutItem = newLayout.find(item => item.i === widget.id);
      if (layoutItem) {
        return { 
          ...widget, 
          positionX: layoutItem.x, 
          positionY: layoutItem.y, 
          width: layoutItem.w, 
          height: layoutItem.h 
        };
      }
      return widget;
    });
    setWidgets(updatedWidgets);
  };

  const toggleFilterableColumn = (columnName: string) => {
    setFilterableColumns((currentFilterableColumns) =>
      currentFilterableColumns.includes(columnName)
        ? currentFilterableColumns.filter((column) => column !== columnName) // Remove a coluna
        : [...currentFilterableColumns, columnName] // Adiciona a coluna
    );
  };

  // --- Retorno do Hook ---
  // Expondo todos os estados e funções que o componente precisará
  return {
    widgets,
    isCreationDialogOpen,
    setIsCreationDialogOpen,
    newWidgetType,
    setNewWidgetType,
    newWidgetColumn,
    setNewWidgetColumn,
    newWidgetTitle,
    setNewWidgetTitle,
    newKpiOperation,
    setNewKpiOperation,
    availableColumnHeaders,
    handleAddWidget,
    handleRemoveWidget,
    handleLayoutChange,
    globalFilterColumn,
    setGlobalFilterColumn,
    globalFilterValue,
    setGlobalFilterValue,
    uniqueGlobalColumnValues,
    filteredData,
    filterableColumns,
    toggleFilterableColumn,
  };
}