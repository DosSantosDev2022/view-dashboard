import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // 1. Importamos as ferramentas de persistência
import { WidgetConfig } from '@/hooks/useDashboardBuilder'; // Importamos o tipo que já temos

type DataRow = { [key: string]: any };

interface DataState {
  processedData: DataRow[];
  setProcessedData: (data: DataRow[]) => void;
  widgets: WidgetConfig[]; // 2. Adicionamos o estado dos widgets aqui
  setWidgets: (widgets: WidgetConfig[]) => void; // E a função para atualizá-los
  clearSession: () => void; // Renomeamos 'clearData' para ser mais claro
}

// 3. Envolvemos nossa criação de store com o middleware 'persist'
export const useDataStore = create(
  persist<DataState>(
    (set) => ({
      processedData: [],
      setProcessedData: (data) => set({ processedData: data }),
      widgets: [],
      setWidgets: (widgets) => set({ widgets: widgets }),
      clearSession: () => set({ processedData: [], widgets: [] }),
    }),
    {
      name: 'dashboard-session-storage', // Nome da "chave" no sessionStorage
      storage: createJSONStorage(() => sessionStorage), // Define o sessionStorage como local de armazenamento
    }
  )
);