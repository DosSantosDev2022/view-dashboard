import { create } from 'zustand';

// Definindo os tipos para o nosso estado
type DataRow = { [key: string]: any };

interface DataState {
  data: DataRow[];
  setData: (newData: DataRow[]) => void;
  clearData: () => void;
}

// Criando o store com o estado inicial e as "ações" (funções para modificar o estado)
export const useDataStore = create<DataState>((set) => ({
  data: [],
  setData: (newData) => set({ data: newData }),
  clearData: () => set({ data: [] }),
}));