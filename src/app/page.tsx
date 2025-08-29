"use client";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Upload, PlusSquare } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function HomePage() {
  
  const { 
    selectedFile, 
    isLoading, 
    handleFileChange, 
    handleUpload 
  } = useFileUpload();

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