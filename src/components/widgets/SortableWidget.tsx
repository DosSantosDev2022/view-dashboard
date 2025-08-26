"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../ui';
import { X } from 'lucide-react';

interface SortableWidgetProps {
  id: string;
  children: React.ReactNode;
  onRemove: (id: string) => void;
}

export function SortableWidget({ id, children,onRemove  }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // Propriedade para saber se o item está sendo arrastado
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Adiciona uma opacidade e um contorno enquanto o item está sendo arrastado
    opacity: isDragging ? 0.5 : 1,
    outline: isDragging ? '2px solid #6366f1' : 'none',
    outlineOffset: '4px',
    borderRadius: '8px', // Para o contorno ficar bonito
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className='relative group'>
       <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 h-7 w-7 z-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        // 2. O onClick agora fica mais simples, sem precisar parar a propagação.
        onClick={() => onRemove(id)}
      >
        <X className="h-6 w-6" />
      </Button>
      {children}
    </div>
  );
}