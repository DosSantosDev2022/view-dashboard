"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDataStore } from '@/store/data-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoaderCircle } from 'lucide-react';
import { ActionsButtons } from '@/components/global/action-buttons';
import { useVirtualizer } from '@tanstack/react-virtual';

export default function TablePage() {
 const { processedData: data, clearSession } = useDataStore();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => { setIsHydrated(true); }, []);

  useEffect(() => {
    if (isHydrated && (!data || data.length === 0)) {
      router.push('/');
    }
  }, [data, isHydrated, router]);

  const handleReset = () => {
    clearSession();
    router.push('/');
  };

  const parentRef = useRef<HTMLDivElement>(null);

  // A configuração do virtualizer permanece a mesma
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 41,
    overscan: 5,
  });

  if (!isHydrated || !data || data.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className='flex items-center justify-center gap-3'>
          <LoaderCircle className='animate-spin' />
          Carregando Sessão...
        </span>
      </div>
    );
  }

  const headers = Object.keys(data[0] || {});
  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div>
      <header className="bg-background border-b shadow-sm">
        <nav className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Dados Brutos</h1>
          <ActionsButtons />
        </nav>
      </header>
      
      <main className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Dados Carregados</CardTitle>
            <CardDescription>Exibindo {data.length.toLocaleString('pt-BR')} linhas.</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
             <div ref={parentRef} className="overflow-auto max-h-[70vh] border rounded-md scrollbar-custom">
              {/* Usamos os componentes <Table> do shadcn/ui normalmente */}
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header) => (<TableHead key={header} className="sticky top-0 bg-primary text-primary-foreground dark:text-foreground dark:bg-card">{header}</TableHead>))}
                  </TableRow>
                </TableHeader>
                
                {/* ========================================================= */}
                {/* A NOVA LÓGICA DE VIRTUALIZAÇÃO ESTÁ AQUI */}
                {/* ========================================================= */}
                <TableBody>
                  {/* 1. Linha "fantasma" de preenchimento superior */}
                  {virtualItems.length > 0 && (
                    <TableRow style={{ height: `${virtualItems[0].start}px` }} />
                  )}

                  {/* 2. Renderiza apenas as linhas visíveis */}
                  {virtualItems.map((virtualItem) => {
                    const row = data[virtualItem.index];
                    return (
                      <TableRow key={virtualItem.key}>
                        {headers.map((header) => (
                          <TableCell key={`${header}-${virtualItem.index}`}>
                            {row[header] instanceof Date
                                ? row[header].toLocaleString('pt-BR', { timeZone: 'UTC' })
                                : String(row[header] ?? '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                  
                  {/* 3. Linha "fantasma" de preenchimento inferior */}
                  {virtualItems.length > 0 && (
                     <TableRow style={{ height: `${rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end}px` }} />
                  )}
              </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}