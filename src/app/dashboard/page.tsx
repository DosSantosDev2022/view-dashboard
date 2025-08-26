"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDataStore } from '@/store/data-store'; // 1. Importa o hook do store
import { DashboardBuilder } from '@/components/DashboardBuilder';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function DashboardPage() {
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

  return (
    <div>
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Seu Dashboard</h1>
          <div className="flex gap-4">
            <Button variant="ghost" asChild><Link href="/dashboard">Dashboard</Link></Button>
            <Button variant="ghost" asChild><Link href="/table">Tabela de Dados</Link></Button>
            <Button variant="destructive" onClick={handleReset}>Encerrar Sessão</Button>
          </div>
        </nav>
      </header>
      <DashboardBuilder data={data} onReset={clearData} />
    </div>
  );
}