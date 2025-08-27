"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDataStore } from '@/store/data-store';
import { toast } from 'sonner';

// Os tipos podem ser definidos aqui para serem exportados e usados em outros lugares
export type Column = {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date';
};
export type DataRow = { [key: string]: any };

export function useCreateTable() {
  // 1. Toda a gestão de estado é movida para cá
  const [step, setStep] = useState<'schema' | 'data'>('schema');
  const [columns, setColumns] = useState<Column[]>([{ id: `col_${Date.now()}`, name: '', type: 'text' }]);
  const [rows, setRows] = useState<DataRow[]>([]);
  const [newRow, setNewRow] = useState<DataRow>({});

  // --- NOVO: Estados para controlar a edição ---
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingRowData, setEditingRowData] = useState<DataRow | null>(null)
  
  // Dependências externas também são gerenciadas aqui dentro
  const setData = useDataStore((state) => state.setProcessedData);
  const router = useRouter();

  // 2. Todas as funções de lógica são movidas para cá
  const addColumn = () => {
    setColumns([...columns, { id: `col_${Date.now()}`, name: '', type: 'text' }]);
  };

  const removeColumn = (id: string) => {
    setColumns(columns.filter(col => col.id !== id));
  };

  const updateColumn = (id: string, field: 'name' | 'type', value: string) => {
    setColumns(columns.map(col => col.id === id ? { ...col, [field]: value } : col));
  };

  const goToDataStep = () => {
    if (columns.some(col => !col.name.trim())) {
      toast.error('Todos os nomes de colunas devem ser preenchidos.');
      return;
    }
    const initialRow = columns.reduce((acc, col) => ({ ...acc, [col.name]: '' }), {});
    setNewRow(initialRow);
    setStep('data');
  };

  const handleNewRowChange = (columnName: string, value: any) => {
    setNewRow({ ...newRow, [columnName]: value });
  };

  const addRow = () => {
    if (Object.values(newRow).every(val => val === '')) {
      toast.error('Preencha pelo menos um campo para adicionar a linha.');
      return;
    }
    setRows([...rows, newRow]);
    const initialRow = columns.reduce((acc, col) => ({ ...acc, [col.name]: '' }), {});
    setNewRow(initialRow);
  };
  
  const finalizeAndCreateDashboard = () => {
    const processedRows = rows.map(row => {
      const processedRow = { ...row };
      columns.forEach(col => {
        if (col.type === 'number' && processedRow[col.name]) {
          processedRow[col.name] = parseFloat(processedRow[col.name]);
        }
      });
      return processedRow;
    });

    setData(processedRows);
    router.push('/dashboard');
  };

  // --- NOVAS FUNÇÕES: Lógica para editar, salvar, cancelar e remover ---
  
  /** Inicia o processo de edição de uma linha. */
  const startEditing = (index: number) => {
    setEditingRowIndex(index);
    // Cria uma cópia dos dados da linha para edição, para não alterar o estado original diretamente
    setEditingRowData({ ...rows[index] });
  };

  /** Atualiza o estado dos dados da linha que está sendo editada. */
  const handleEditRowChange = (columnName: string, value: any) => {
    if (editingRowData) {
      setEditingRowData({ ...editingRowData, [columnName]: value });
    }
  }

  /** Salva as alterações feitas na linha. */
  const saveEditedRow = () => {
    if (editingRowIndex !== null && editingRowData) {
      const updatedRows = [...rows];
      updatedRows[editingRowIndex] = editingRowData;
      setRows(updatedRows);
      // Limpa o estado de edição
      setEditingRowIndex(null);
      setEditingRowData(null);
    }
  };

  /** Cancela a edição, limpando o estado. */
  const cancelEditing = () => {
    setEditingRowIndex(null);
    setEditingRowData(null);
  };

  /** Remove uma linha da tabela. */
  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
    // Limpa o estado de edição
    setEditingRowIndex(null);
    setEditingRowData(null);
  };

  // 3. O hook retorna um objeto com todos os estados e funções que o componente precisará
  return {
    step,
    columns,
    rows,
    newRow,
    addColumn,
    removeColumn,
    updateColumn,
    goToDataStep,
    handleNewRowChange,
    addRow,
    finalizeAndCreateDashboard,
    editingRowData,
    startEditing,
    handleEditRowChange,
    saveEditedRow,
    cancelEditing,
    removeRow,
    editingRowIndex,
  };
}