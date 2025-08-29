"use client";

// ALTERADO: Renomeado 'RGL' para um nome completo
import ReactGridLayoutLibrary, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Imports de Ícones
import { Filter } from "lucide-react";

// Imports dos Nossos Componentes e Hooks
import { useDashboardBuilder, WidgetConfiguration } from "@/hooks/useDashboardBuilder";
import { KpiCardWidget } from "./widgets/KpiCardWidget";
import { BarChartWidget } from "./widgets/BarChartWidget";
import { PieChartWidget } from "./widgets/PieChartWidget";
import { headers } from "next/headers";
import { Input } from "./ui";

// ALTERADO: A constante agora usa o nome completo da biblioteca
const ResponsiveGridLayout = WidthProvider(ReactGridLayoutLibrary);

// Tipos de dados
type DataRow = { [key: string]: any };

interface DashboardBuilderParameters {
  data: DataRow[];
}

export function DashboardBuilder({ data }: DashboardBuilderParameters) {
  // Desestruturando o hook com os nomes de variáveis completos
  const {
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
  } = useDashboardBuilder({ data });

  // Convertendo nosso estado de widgets para o formato que a biblioteca de grid precisa
  // Mapeamos nossos nomes descritivos (positionX) para os nomes curtos que a biblioteca espera (x)
  const gridLayout = widgets.map((widget) => ({
    i: widget.id,
    x: widget.positionX,
    y: widget.positionY,
    w: widget.width,
    h: widget.height,
  }));

  return (
    <main className="container mx-auto p-8">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Construtor de Dashboard</h1>
          <p className="text-muted-foreground">
            Adicione e organize os componentes para visualizar seus dados.
          </p>
        </div>

        <div className="flex gap-2">
          {/* Botão e Dialog para configurar quais colunas são filtros */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Configurar Filtros
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Selecionar Colunas para Filtragem</DialogTitle>
                <p className="text-sm text-muted-foreground pt-1">
                  Marque as colunas que poderão ser usadas nos filtros globais.
                </p>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                {availableColumnHeaders.map((header) => (
                  <div key={header} className="flex items-center space-x-2">
                    <Checkbox
                      id={`checkbox-${header}`}
                      checked={filterableColumns.includes(header)}
                      onCheckedChange={() => toggleFilterableColumn(header)}
                    />
                    <Label htmlFor={`checkbox-${header}`} className="cursor-pointer">
                      {header}
                    </Label>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Botão e Dialog para adicionar um novo componente */}
          <Dialog open={isCreationDialogOpen} onOpenChange={setIsCreationDialogOpen}>
            <DialogTrigger asChild>
              <Button>Adicionar Componente</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Novo Componente</DialogTitle>
              </DialogHeader>
              {/* Formulário de criação de widget */}
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
                      {availableColumnHeaders.map((header) => (
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
      </header>

      {/* Seção de Filtros Globais */}
      <section className="flex items-center gap-4 p-4 mb-6 border rounded-lg bg-card">
        <h3 className="text-lg font-semibold whitespace-nowrap">Filtros</h3>
        
        {/* Seletor da Coluna de Filtro */}
        <div className="flex-1 min-w-[200px]">
          <Select 
            value={globalFilterColumn} 
            onValueChange={setGlobalFilterColumn}
            disabled={filterableColumns.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                  filterableColumns.length === 0 
                  ? "Configure as colunas de filtro" 
                  : "Filtrar por Coluna"
                } />
            </SelectTrigger>
            <SelectContent>
              {filterableColumns.map((columnHeader) => (
                <SelectItem key={columnHeader} value={columnHeader}>{columnHeader}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Seletor do Valor de Filtro */}
        {globalFilterColumn && (
          <div className="flex-1 min-w-[200px]">
            <Select value={globalFilterValue} onValueChange={setGlobalFilterValue}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o Valor" />
              </SelectTrigger>
              <SelectContent>
                {uniqueGlobalColumnValues.map((value) => (
                  <SelectItem key={String(value)} value={String(value)}>
                    {String(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Botão para Limpar Filtro */}
        <Button 
          variant="ghost" 
          onClick={() => setGlobalFilterColumn("")}
          disabled={!globalFilterColumn}
        >
          Limpar Filtro
        </Button>
      </section>

      {/* Área de Renderização dos Widgets */}
      <ResponsiveGridLayout
        className="layout"
        layout={gridLayout}
        onLayoutChange={handleLayoutChange}
        cols={12}
        rowHeight={150}
        isDraggable
        isResizable
      >
        {widgets.map((widgetConfiguration) => (
          <div
            key={widgetConfiguration.id}
            data-grid={{ 
              x: widgetConfiguration.positionX, 
              y: widgetConfiguration.positionY, 
              w: widgetConfiguration.width, 
              h: widgetConfiguration.height 
            }}
          >
            {/* Renderização condicional dos widgets */}
            {widgetConfiguration.type === "kpi" && (
              <KpiCardWidget
                title={widgetConfiguration.title}
                data={filteredData}
                column={widgetConfiguration.kpiColumn!}
                operation={widgetConfiguration.kpiOperation!}
                onRemove={handleRemoveWidget}
                widgetId={widgetConfiguration.id}
              />
            )}
            {widgetConfiguration.type === "bar-chart" && (
              <BarChartWidget
                title={widgetConfiguration.title}
                data={filteredData}
                category={widgetConfiguration.categoryColumn!}
                onRemove={handleRemoveWidget}
                widgetId={widgetConfiguration.id}
              />
            )}
            {widgetConfiguration.type === "pie-chart" && (
              <PieChartWidget
                title={widgetConfiguration.title}
                data={filteredData}
                category={widgetConfiguration.categoryColumn!}
                onRemove={handleRemoveWidget}
                widgetId={widgetConfiguration.id}
              />
            )}
          </div>
        ))}
      </ResponsiveGridLayout>
    </main>
  );
}