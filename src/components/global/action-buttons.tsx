'use client'
import Link from "next/link"
import { Button } from "../ui"
import { ToggleTheme } from "./toggle-theme"
import { useDataStore } from "@/store/data-store"
import { useRouter } from "next/navigation"

const ActionsButtons = () => {
 const { clearSession } = useDataStore();
 const router = useRouter(); 
 
 const handleReset = () => {
    clearSession();
    router.push('/');
  }

  return (
     <div className="flex gap-4">
     <Button variant="ghost" asChild><Link href="/dashboard">Dashboard</Link></Button>
     <Button variant="ghost" asChild><Link href="/table">Tabela de Dados</Link></Button>
     <Button variant="destructive" onClick={handleReset}>Encerrar Sessão</Button>
     <ToggleTheme />
    </div>
  )
}

export{ActionsButtons}