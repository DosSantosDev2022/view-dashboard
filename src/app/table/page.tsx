"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDataStore } from '@/store/data-store'; // 1. Importa o hook do store
import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle ,Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';

type DataRow = { [key: string]: any };

export default function TablePage() {
  // 2. Pega os dados e as ações do store
  const data = useDataStore((state) => state.data);
  const clearData = useDataStore((state) => state.clearData);
  const router = useRouter();

  useEffect(() => {
    if (data.length === 0) {
      router.push('/');
    }
  }, [data, router]);

  const handleReset = () => {
    clearData(); // 3. Usa a nova ação para limpar o estado
    router.push('/');
  }

  if (data.length === 0) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  const headers = Object.keys(data[0] || {});

  return (
    <div>
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Dados Brutos</h1>
          <div className="flex gap-4">
            <Button variant="ghost" asChild><Link href="/dashboard">Dashboard</Link></Button>
            <Button variant="ghost" asChild><Link href="/table">Tabela de Dados</Link></Button>
            <Button variant="destructive" onClick={handleReset}>Encerrar Sessão</Button>
          </div>
        </nav>
      </header>
      
      <main className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Dados Carregados</CardTitle>
            <CardDescription>Esta é a tabela com os dados brutos do seu arquivo.</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="overflow-auto max-h-[70vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header) => (<TableHead key={header}>{header}</TableHead>))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {headers.map((header) => (
                        <TableCell key={`${header}-${rowIndex}`}>
                          {row[header] instanceof Date
                              ? row[header].toLocaleString('pt-BR', { timeZone: 'UTC' })
                              : String(row[header] ?? '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}