"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, Calendar, FolderSyncIcon as Sync } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Usuario = {
  email: string
  nombre: string
  avatar?: string
}

type GoogleAuthProps = {
  onUsuarioChange: (usuario: Usuario | null) => void
}

export default function GoogleAuth({ onUsuarioChange }: GoogleAuthProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sincronizando, setSincronizando] = useState(false)

  // Simulación de usuarios (en producción sería con Google OAuth)
  const usuariosDemo = [
    { email: "melina.nieto.work@gmail.com", nombre: "Melina", avatar: "👩‍💼" },
    { email: "tomasaluch.ar@gmail.com", nombre: "Tomas", avatar: "👨‍💻" },
  ]

  const iniciarSesion = (usuarioDemo: Usuario) => {
    setUsuario(usuarioDemo)
    onUsuarioChange(usuarioDemo)
    setDialogOpen(false)

    // Simular sincronización inicial
    setSincronizando(true)
    setTimeout(() => {
      setSincronizando(false)
    }, 2000)
  }

  const cerrarSesion = () => {
    setUsuario(null)
    onUsuarioChange(null)
  }

  const sincronizarCalendario = async () => {
    if (!usuario) return

    setSincronizando(true)

    // Simular sincronización con Google Calendar
    setTimeout(() => {
      setSincronizando(false)
      // Aquí podrías mostrar una notificación de éxito
    }, 3000)
  }

  if (usuario) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{usuario.avatar}</div>
              <div>
                <p className="font-medium text-gray-800 text-sm">{usuario.nombre}</p>
                <p className="text-xs text-gray-600">{usuario.email}</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                Conectado
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={sincronizarCalendario}
                disabled={sincronizando}
                className="h-8 px-3"
              >
                <Sync className={`w-3 h-3 mr-1 ${sincronizando ? "animate-spin" : ""}`} />
                {sincronizando ? "Sync..." : "Sync"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cerrarSesion}
                className="h-8 px-3 text-red-600 hover:text-red-700"
              >
                <LogOut className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-dashed border-2 border-blue-200 cursor-pointer hover:border-blue-300 transition-colors">
          
        </Card>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-blue-50 to-indigo-50 w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-blue-800 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Conectar Google Calendar
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Selecciona tu cuenta para sincronizar eventos con Google Calendar:</p>

          <div className="space-y-3">
            {usuariosDemo.map((usuarioDemo) => (
              <Button
                key={usuarioDemo.email}
                variant="outline"
                onClick={() => iniciarSesion(usuarioDemo)}
                className="w-full justify-start h-12 bg-white hover:bg-blue-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{usuarioDemo.avatar}</span>
                  <div className="text-left">
                    <p className="font-medium text-sm">{usuarioDemo.nombre}</p>
                    <p className="text-xs text-gray-500">{usuarioDemo.email}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">🔒 Funciones de sincronización:</p>
            <ul className="space-y-1">
              <li>• Importar eventos de Google Calendar</li>
              <li>• Exportar eventos creados en la app</li>
              <li>• Sincronización bidireccional automática</li>
              <li>• Notificaciones de recordatorios</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
