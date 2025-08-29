// hooks/useFileUpload.ts
"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import * as XLSX from "xlsx";
import { useDataStore } from "@/store/data-store";

// ============================================================================
// 1. Funções Auxiliares
// ============================================================================

function convertExcelDate(excelDateNumber: number): Date {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const unixEpochTimestamp = (excelDateNumber - 25569) * millisecondsPerDay;
  return new Date(unixEpochTimestamp);
}

function isLikelyDate(cell: XLSX.CellObject | undefined, key: string): boolean {
  if (!cell || cell.t !== 'n' || !cell.v) {
    return false;
  }

  if (cell.z) {
    let formatString = '';
    if (typeof cell.z === 'string') {
      formatString = cell.z;
    } else if (typeof cell.z === 'number') {
      const ssfTable = XLSX.SSF.get_table();
      formatString = ssfTable[cell.z];
    }

    if (formatString && /[dmyhsa]/i.test(formatString)) {
      return true;
    }
  }
  
  const lowerCaseKey = key.toLowerCase();
  const dateKeywords = ['data', 'date', 'prazo', 'início', 'fim', 'horário', 'time'];
  if (dateKeywords.some(keyword => lowerCaseKey.includes(keyword))) {
    return typeof cell.v === 'number' && cell.v > 0;
  }

  return false;
}

// ============================================================================
// 2. Definição do Custom Hook
// ============================================================================

export function useFileUpload() {
  // ----------------
  // Hooks e Estados
  // ----------------
  // Estado para armazenar o arquivo selecionado pelo usuário.
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Estado para controlar a exibição do loader durante o processamento.
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Acessando o store (Zustand) para salvar os dados processados.
  const setProcessedData = useDataStore((state) => state.setProcessedData);
  // Hook do Next.js para fazer a navegação programática.
  const router = useRouter();

  // ----------------
  // Manipuladores de Eventos (Handlers)
  // ----------------

  /**
   * Atualiza o estado 'selectedFile' quando o usuário escolhe um arquivo no input.
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  /**
   * Processa o arquivo Excel selecionado, extrai os dados,
   * salva no store e redireciona para o dashboard.
   */
  const handleUpload = () => {
    if (!selectedFile) {
      alert("Por favor, selecione um arquivo primeiro.");
      return;
    }
    
    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryStr = event.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json<{[key: string]: any}>(worksheet, { raw: true });
        
        if (jsonData.length === 0) {
          throw new Error("A planilha está vazia ou em um formato não suportado.");
        }

        const headers = Object.keys(jsonData[0]);

        const processedData = jsonData.map((row, rowIndex) => {
          const newRow = { ...row };
          headers.forEach((key, colIndex) => {
            const cellAddress = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
            const cell = worksheet[cellAddress];
            
            if (isLikelyDate(cell, key)) {
              newRow[key] = convertExcelDate(cell.v as number);
            }
          });
          return newRow;
        });

        setProcessedData(processedData);
        router.push('/dashboard');

      } catch (error) {
        console.error("Erro ao processar o arquivo:", error);
        alert(error instanceof Error ? error.message : "Ocorreu um erro desconhecido.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  // ----------------
  // Retorno do Hook
  // ----------------
  // Expondo os estados e as funções que o componente precisará usar.
  return {
    selectedFile,
    isLoading,
    handleFileChange,
    handleUpload,
  };
}