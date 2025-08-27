"use client";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Importando nossos componentes de widget
import { KpiCardWidget } from "./widgets/KpiCardWidget";
import { BarChartWidget } from "./widgets/BarChartWidget";
import { Input } from "./ui";
import { useDashboardBuilder } from "@/hooks/useDashboardBuilder";
import { PieChartWidget } from "./widgets/PieChartWidget";

const ResponsiveGridLayout = WidthProvider(RGL);

type DataRow = { [key: string]: any };

// Definindo a "receita" de um widget
export type WidgetConfig = {
  id: string; // Renomeado de 'i' para 'id' para manter consistência
  title: string;
  type: "kpi" | "bar-chart";
  // Layout props
  x: number;
  y: number;
  w: number; // width em unidades de grade
  h: number; // height em unidades de grade
  // Props específicas
  kpiColumn?: string;
  kpiOperation?: "count" | "sum";
  barChartCategory?: string;
};

interface DashboardBuilderProps {
  data: DataRow[];
  /* onReset: () => void; */
}

export function DashboardBuilder({ data }: DashboardBuilderProps) {
  const {
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
  } = useDashboardBuilder({ data });

  // Convertendo nosso estado de widgets para o formato que a biblioteca precisa
  const layout = widgets.map((w) => ({
    i: w.id,
    x: w.x,
    y: w.y,
    w: w.w,
    h: w.h,
  }));

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Construtor de Dashboard</h1>
          <p className="text-gray-500">
            Adicione e organize os componentes para visualizar seus dados.
          </p>
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
                {/* 3. NOVO: Campo para o Título do Componente */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="widget-title" className="text-right">
                    Título
                  </Label>
                  <Input
                    id="widget-title"
                    placeholder="Ex: Vendas por Região"
                    className="col-span-3"
                    value={newWidgetTitle}
                    onChange={(e) => setNewWidgetTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="widget-type" className="text-right">
                    Tipo
                  </Label>
                  <Select
                    value={newWidgetType}
                    onValueChange={(value: any) => setNewWidgetType(value)}
                  >
                    <SelectTrigger className="col-span-3 w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kpi">
                        Cartão de KPI (Contagem)
                      </SelectItem>
                      <SelectItem value="bar-chart">
                        Gráfico de Barras (Contagem)
                      </SelectItem>
                      <SelectItem value="pie-chart">
                        Gráfico de Pizza
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* NOVO: Menu de seleção condicional para o tipo de cálculo */}
                {newWidgetType === "kpi" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="kpi-operation" className="text-right">
                      Cálculo
                    </Label>
                    <Select
                      value={newKpiOperation}
                      onValueChange={(value: any) => setNewKpiOperation(value)}
                    >
                      <SelectTrigger className="col-span-3 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="count">
                          Contagem Total (Linhas)
                        </SelectItem>
                        <SelectItem value="unique">
                          Contagem de Únicos
                        </SelectItem>
                        <SelectItem value="sum">
                          Soma (para colunas numéricas)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="widget-column" className="text-right">
                    Coluna
                  </Label>
                  <Select
                    value={newWidgetColumn}
                    onValueChange={(value) => setNewWidgetColumn(value)}
                  >
                    <SelectTrigger className="col-span-3 w-full">
                      <SelectValue placeholder="Selecione a coluna" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddWidget}>Adicionar ao Painel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Área onde os widgets do dashboard são renderizados com Drag-and-Drop */}
      <ResponsiveGridLayout
        className="layout"
        layout={layout}
        onLayoutChange={onLayoutChange}
        cols={12} // A grade tem 12 colunas
        rowHeight={150} // Altura de cada linha em pixels
        isDraggable
        isResizable
      >
        {widgets.map((widget) => (
          <div
            key={widget.id}
            data-grid={{ x: widget.x, y: widget.y, w: widget.w, h: widget.h }}
          >
            {widget.type === "kpi" &&
              widget.kpiColumn &&
              widget.kpiOperation && (
                <KpiCardWidget
                  title={widget.title}
                  data={data}
                  column={widget.kpiColumn}
                  operation={widget.kpiOperation}
                  onRemove={handleRemoveWidget}
                  widgetId={widget.id}
                />
              )}
            {widget.type === "bar-chart" && widget.categoryColumn && (
              <BarChartWidget
                title={widget.title}
                data={data}
                category={widget.categoryColumn}
                onRemove={handleRemoveWidget}
                widgetId={widget.id}
              />
            )}
            {widget.type === "pie-chart" && widget.categoryColumn && (
              <PieChartWidget
                widgetId={widget.id}
                onRemove={handleRemoveWidget}
                title={widget.title}
                data={data}
                category={widget.categoryColumn}
              />
            )}
          </div>
        ))}
      </ResponsiveGridLayout>
    </main>
  );
}
