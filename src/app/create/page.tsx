"use client";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle,Input,Label,Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui';

import { Trash2, PlusCircle } from 'lucide-react';
import { useCreateTable, Column, DataRow } from '@/hooks/useCreateTable';
import { useState } from 'react';

export default function CreateTablePage() {

  const {
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
  } = useCreateTable();

  // 2. Novo estado para controlar a visibilidade do modal de "Adicionar Linha"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleConfirmAddRow = () => {
    // A função addRow já está no nosso hook, nós apenas a chamamos
    addRow();
    // E fechamos o modal após adicionar
    setIsModalOpen(false);
  };

  // Funções para controlar o modal de edição
  const handleRowClick = (index: number) => {
    startEditing(index); // Prepara os dados para edição
    setIsEditModalOpen(true); // Abre o modal
  };

   const handleConfirmSaveChanges = () => {
    saveEditedRow();
    setIsEditModalOpen(false);
  };

  const handleDeleteRow = () => {
    if (editingRowIndex !== null && confirm('Tem certeza que deseja excluir esta linha?')) {
      removeRow(editingRowIndex);
      setIsEditModalOpen(false);
    }
  };

  if (step === 'schema') {
    return (
      <main className="container mx-auto p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Etapa 1: Defina as Colunas da sua Tabela</CardTitle>
          </CardHeader>
          <CardContent>
            {columns.map((col, index) => (
              <div key={col.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-center">
                <Input placeholder={`Nome da Coluna ${index + 1}`} value={col.name} onChange={(e) => updateColumn(col.id, 'name', e.target.value)} />
                <Select value={col.type} onValueChange={(value) => updateColumn(col.id, 'type', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="date">Data</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => removeColumn(col.id)} disabled={columns.length <= 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex justify-between items-center mt-6">
              <Button variant="outline" onClick={addColumn}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Coluna</Button>
              <Button onClick={goToDataStep}>Próximo Passo: Adicionar Dados</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Etapa 2: Adicione os Dados</CardTitle>
              <CardDescription>Sua tabela possui {rows.length} linha(s).</CardDescription>
            </div>
            {/* 3. Botão principal para abrir o modal de adicionar linha */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Nova Linha</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Linha</DialogTitle>
                </DialogHeader>
                {/* 4. O formulário agora vive dentro do conteúdo do modal */}
                <div className="grid grid-cols-1 gap-4 py-4 overflow-auto max-h-[60vh]">
                  {columns.map(col => (
                    <div key={col.id} className="space-y-1.5 p-1">
                      <Label htmlFor={col.id}>{col.name}</Label>
                      <Input 
                        id={col.id}
                        type={col.type}
                        value={newRow[col.name] || ''} 
                        onChange={(e) => handleNewRowChange(col.name, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleConfirmAddRow}>Confirmar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* 5. Ajustes na div da tabela para melhor rolagem */}
          <div className="relative w-full border rounded-md overflow-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(col => (
                    // 6. Cabeçalho "sticky" para permanecer visível durante a rolagem
                    <TableHead key={col.id} className="sticky top-0 bg-card z-10">
                      {col.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((row, rowIndex) => (
                     <TableRow key={rowIndex} onClick={() => handleRowClick(rowIndex)} className="cursor-pointer hover:bg-muted/50">
                      {columns.map(col => <TableCell key={col.id}>{String(row[col.name] ?? '')}</TableCell>)}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Nenhuma linha adicionada ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={finalizeAndCreateDashboard} disabled={rows.length === 0}>Finalizar e Criar Dashboard</Button>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* NOVO: Modal de Edição */}
      {/* ========================================================= */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Editar Linha</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {editingRowData && columns.map(col => (
              <div key={col.id} className="space-y-1.5">
                <Label htmlFor={`edit-${col.id}`}>{col.name}</Label>
                <Input 
                  id={`edit-${col.id}`}
                  type={col.type}
                  value={editingRowData[col.name] || ''} 
                  onChange={(e) => handleEditRowChange(col.name, e.target.value)}
                />
              </div>
            ))}
          </div>
          <DialogFooter className="justify-between">
            
            <div className='space-x-1'>
              <Button onClick={handleConfirmSaveChanges} className="ml-2">Salvar Alterações</Button>
              <DialogClose asChild><Button variant="outline" onClick={cancelEditing}>Cancelar</Button></DialogClose>
              <Button variant="destructive" onClick={handleDeleteRow}>Excluir Linha</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}