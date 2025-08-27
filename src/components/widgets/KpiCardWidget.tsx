"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

// Tipos de dados que o componente espera receber
type DataRow = { [key: string]: any };

export type KpiOperation = "count" | "sum" | "unique";

interface KpiCardWidgetProps {
  title: string;
  data: DataRow[];
  column: string;
  operation: KpiOperation;
  widgetId: string;
  onRemove: (id: string) => void;
}

export function KpiCardWidget({
  title,
  data,
  column,
  operation,
  onRemove,
  widgetId,
}: KpiCardWidgetProps) {
  const calculatedValue = useMemo(() => {
    if (!data || data.length === 0) return 0;

    switch (operation) {
      case "unique": {
        const allValues = data.map((row) => row[column]);
        const uniqueValues = new Set(allValues);
        return uniqueValues.size;
      }
      case "count":
        return data.length;
      case "sum":
        return data.reduce((total, row) => {
          const value = parseFloat(row[column]);
          return total + (isNaN(value) ? 0 : value);
        }, 0);
      default:
        return 0;
    }
  }, [data, column, operation]);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-background dark:bg-secondary/40 rounded-lg border border-border px-6 py-4">
      <div className="flex items-start justify-between">
        <span className="text-lg font-semibold text-foreground truncate">
          {title}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => onRemove(widgetId)}
              className="h-7 w-7 -mr-2 -mt-1 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remover componente</TooltipContent>
        </Tooltip>
      </div>

      <div className="text-4xl font-bold">
        {calculatedValue.toLocaleString("pt-BR")}
      </div>
    </div>
  );
}
