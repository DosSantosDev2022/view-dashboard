"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDataStore } from '@/store/data-store'; // 1. Importa o hook do store
import { DashboardBuilder } from '@/components/DashboardBuilder';
import { LoaderCircle } from 'lucide-react';
import { ActionsButtons } from '@/components/global/action-buttons';

export default function DashboardPage() {
  const { processedData, clearSession } = useDataStore();
  const router = useRouter(); 
  // 1. Estado para controlar se o componente foi "hidratado"
  const [isHydrated, setIsHydrated] = useState(false);

  // 2. useEffect para rodar apenas no cliente
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Essa verificação agora só roda após a hidratação
    if (isHydrated && processedData.length === 0) {
      router.push('/');
    }
  }, [processedData, isHydrated, router]);

  // 3. Mostra um carregamento enquanto o estado não for recuperado do sessionStorage
  if (!isHydrated || processedData.length === 0) {
    return <div className="flex min-h-screen items-center justify-center">
        <span className='flex items-center justify-center gap-3'>
          <LoaderCircle className='animate-spin duration-500' />
          Carregando...
        </span>
      </div>;
  }

  return (
    <div>
      <header className="bg-background shadow-sm">
        <nav className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Seu Dashboard</h1>
          <ActionsButtons />
        </nav>
      </header>
      <DashboardBuilder data={processedData} />
    </div>
  );
}