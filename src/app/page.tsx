"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Importa o Link para navegação
import * as XLSX from "xlsx";
import { useDataStore } from "@/store/data-store";

// Componentes Shadcn UI...
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Upload, PlusSquare } from "lucide-react"; // Ícones


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
    // Primeiro, verificamos se 'z' é uma string
    if (typeof cell.z === 'string') {
      formatString = cell.z;
    } 
    // Se for um número, usamos a tabela de formatos da biblioteca para obter a string
    else if (typeof cell.z === 'number') {
      const ssfTable = XLSX.SSF.get_table();
      formatString = ssfTable[cell.z];
    }

    // Agora que temos certeza que 'formatString' é uma string, podemos testá-la
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

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const setProcessedData = useDataStore((state) => state.setProcessedData);
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile) return alert("Por favor, selecione um arquivo primeiro.");
    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryStr = event.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Geramos o JSON para ter a estrutura de dados e os cabeçalhos
        const jsonData = XLSX.utils.sheet_to_json<{[key: string]: any}>(worksheet, { raw: true });
        
        if (jsonData.length === 0) {
            throw new Error("A planilha está vazia ou em um formato não suportado.");
        }

        const headers = Object.keys(jsonData[0]);

        // Agora, processamos os dados usando nossa lógica inteligente
        const processedData = jsonData.map((row, rowIndex) => {
          const newRow = { ...row };
          headers.forEach((key, colIndex) => {
            const cellAddress = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
            const cell = worksheet[cellAddress];
            
            // Usamos nossa função detetive!
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Visualizador de Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">Comece a dar vida aos seus dados.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* Opção 1: Carregar Planilha */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-lg hover:border-primary transition-all">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Upload className="w-10 h-10 text-primary" />
                  <div>
                    <CardTitle>Carregar Planilha</CardTitle>
                    <CardDescription>Use um arquivo .xlsx ou .csv existente.</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Faça o upload do seu arquivo de dados</DialogTitle>
            </DialogHeader>
            <div className="grid w-full items-center gap-4 pt-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="file-upload">Selecione o arquivo</Label>
                <Input id="file-upload" type="file" onChange={handleFileChange} accept=".xlsx, .csv" />
              </div>
              <Button onClick={handleUpload} className="w-full" disabled={!selectedFile || isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</>
                ) : "Carregar e Visualizar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Opção 2: Criar Tabela Manualmente */}
        <Link href="/create">
          <Card className="cursor-pointer hover:shadow-lg hover:border-primary transition-all">
            <CardHeader>
              <div className="flex items-center gap-4">
                <PlusSquare className="w-10 h-10 text-primary" />
                <div>
                  <CardTitle>Criar Tabela Manualmente</CardTitle>
                  <CardDescription>Defina suas colunas e adicione dados do zero.</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

      </div>
    </main>
  );
}