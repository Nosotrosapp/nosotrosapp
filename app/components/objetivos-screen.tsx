"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, Plane, Sofa, Camera, Calendar, Edit, Trash2, CheckCircle, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Target } from "lucide-react"
import ObjetivoDetalle from "./objetivo-detalle"

type Objetivo = {
  id: number
  nombre: string
  descripcion: string
  monto_total: number
  monto_ahorrado: number
  fecha_objetivo: string
  completado: boolean
}

const iconos = [Plane, Sofa, Camera, Calendar]

export default function ObjetivosScreen() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingObjetivo, setEditingObjetivo] = useState<Objetivo | null>(null)
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<Objetivo | null>(null)
  const [nuevoObjetivo, setNuevoObjetivo] = useState({
    nombre: "",
    descripcion: "",
    monto_total: "",
    fecha_objetivo: "",
  })
  const [objetivosEliminando, setObjetivosEliminando] = useState<Set<number>>(new Set())

  useEffect(() => {
    cargarObjetivos()
  }, [])

  const cargarObjetivos = async () => {
    try {
      const { data, error } = await supabase.from("objetivos").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setObjetivos(data || [])
    } catch (error) {
      console.error("Error cargando objetivos:", error)
    } finally {
      setLoading(false)
    }
  }

  const agregarObjetivo = async () => {
    if (nuevoObjetivo.nombre && nuevoObjetivo.monto_total && nuevoObjetivo.fecha_objetivo) {
      try {
        const objetivoData = {
          nombre: nuevoObjetivo.nombre,
          descripcion: nuevoObjetivo.descripcion,
          monto_total: Number.parseFloat(nuevoObjetivo.monto_total),
          monto_ahorrado: 0,
          fecha_objetivo: nuevoObjetivo.fecha_objetivo,
          completado: false,
        }

        const { error } = await supabase.from("objetivos").insert([objetivoData])

        if (error) throw error

        await cargarObjetivos()
        setNuevoObjetivo({ nombre: "", descripcion: "", monto_total: "", fecha_objetivo: "" })
        setDialogOpen(false)
      } catch (error) {
        console.error("Error agregando objetivo:", error)
      }
    }
  }

  const editarObjetivo = async () => {
    if (editingObjetivo && nuevoObjetivo.nombre && nuevoObjetivo.monto_total && nuevoObjetivo.fecha_objetivo) {
      try {
        const { error } = await supabase
          .from("objetivos")
          .update({
            nombre: nuevoObjetivo.nombre,
            descripcion: nuevoObjetivo.descripcion,
            monto_total: Number.parseFloat(nuevoObjetivo.monto_total),
            fecha_objetivo: nuevoObjetivo.fecha_objetivo,
          })
          .eq("id", editingObjetivo.id)

        if (error) throw error

        await cargarObjetivos()
        setEditingObjetivo(null)
        setNuevoObjetivo({ nombre: "", descripcion: "", monto_total: "", fecha_objetivo: "" })
        setDialogOpen(false)
      } catch (error) {
        console.error("Error editando objetivo:", error)
      }
    }
  }

  const eliminarObjetivo = async (id: number) => {
    try {
      // Agregar a la lista de eliminando para mostrar animación
      setObjetivosEliminando((prev) => new Set([...prev, id]))

      // Esperar un poco para la animación
      await new Promise((resolve) => setTimeout(resolve, 300))

      const { error } = await supabase.from("objetivos").delete().eq("id", id)
      if (error) throw error

      await cargarObjetivos()

      // Remover de la lista de eliminando
      setObjetivosEliminando((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    } catch (error) {
      console.error("Error eliminando objetivo:", error)
      // Remover de eliminando en caso de error
      setObjetivosEliminando((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const marcarCompletado = async (id: number) => {
    try {
      const { error } = await supabase.from("objetivos").update({ completado: true }).eq("id", id)

      if (error) throw error
      await cargarObjetivos()
    } catch (error) {
      console.error("Error marcando objetivo como completado:", error)
    }
  }

  const abrirEdicion = (objetivo: Objetivo) => {
    setEditingObjetivo(objetivo)
    setNuevoObjetivo({
      nombre: objetivo.nombre,
      descripcion: objetivo.descripcion || "",
      monto_total: objetivo.monto_total.toString(),
      fecha_objetivo: objetivo.fecha_objetivo,
    })
    setDialogOpen(true)
  }

  const cerrarDialog = () => {
    setDialogOpen(false)
    setEditingObjetivo(null)
    setNuevoObjetivo({ nombre: "", descripcion: "", monto_total: "", fecha_objetivo: "" })
  }

  const abrirDetalle = (objetivo: Objetivo) => {
    setObjetivoSeleccionado(objetivo)
  }

  const cerrarDetalle = () => {
    setObjetivoSeleccionado(null)
    cargarObjetivos() // Recargar para mostrar cambios
  }

  // Función para manejar el click en la card
  const handleCardClick = (objetivo: Objetivo, event: React.MouseEvent) => {
    // Si el click fue en un botón o elemento interactivo, no abrir el detalle
    const target = event.target as HTMLElement
    if (target.closest("button") || target.closest('[role="button"]')) {
      return
    }
    abrirDetalle(objetivo)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  // Si hay un objetivo seleccionado, mostrar la pantalla de detalle
  if (objetivoSeleccionado) {
    return <ObjetivoDetalle objetivo={objetivoSeleccionado} onClose={cerrarDetalle} />
  }

  return (
    <div className="space-y-4">
      {/* Botón agregar objetivo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg h-12"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear nuevo objetivo
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gradient-to-br from-cyan-50 to-teal-50 w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-cyan-800">
              {editingObjetivo ? "Editar Objetivo" : "Nuevo Objetivo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre" className="text-sm font-medium">
                Nombre del objetivo
              </Label>
              <Input
                id="nombre"
                value={nuevoObjetivo.nombre}
                onChange={(e) => setNuevoObjetivo({ ...nuevoObjetivo, nombre: e.target.value })}
                placeholder="¿Qué quieren lograr juntos?"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="descripcion" className="text-sm font-medium">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                value={nuevoObjetivo.descripcion}
                onChange={(e) => setNuevoObjetivo({ ...nuevoObjetivo, descripcion: e.target.value })}
                placeholder="Describe este objetivo, qué incluye, por qué es importante..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="monto" className="text-sm font-medium">
                Monto total necesario
              </Label>
              <Input
                id="monto"
                type="number"
                value={nuevoObjetivo.monto_total}
                onChange={(e) => setNuevoObjetivo({ ...nuevoObjetivo, monto_total: e.target.value })}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fecha" className="text-sm font-medium">
                Fecha objetivo
              </Label>
              <Input
                id="fecha"
                type="date"
                value={nuevoObjetivo.fecha_objetivo}
                onChange={(e) => setNuevoObjetivo({ ...nuevoObjetivo, fecha_objetivo: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={cerrarDialog} variant="outline" className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={editingObjetivo ? editarObjetivo : agregarObjetivo}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
              >
                {editingObjetivo ? "Guardar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lista de objetivos */}
      <div className="space-y-4">
        {objetivos.map((objetivo, index) => {
          const IconComponent = iconos[index % iconos.length]
          const progreso = (objetivo.monto_ahorrado / objetivo.monto_total) * 100
          const fechaFormateada = new Date(objetivo.fecha_objetivo).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })

          return (
            <Card
              key={objetivo.id}
              className={`bg-white/90 backdrop-blur-sm shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 ${
                objetivo.completado ? "ring-2 ring-green-200" : ""
              } ${
                objetivosEliminando.has(objetivo.id) ? "opacity-0 scale-95 transform transition-all duration-300" : ""
              }`}
              onClick={(e) => handleCardClick(objetivo, e)}
            >
              <div
                className={`h-2 ${objetivo.completado ? "bg-green-400" : "bg-gradient-to-r from-cyan-400 to-teal-400"}`}
              />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-full ${objetivo.completado ? "bg-green-100" : "bg-gradient-to-r from-cyan-100 to-teal-100"} text-teal-700 shadow-lg`}
                    >
                      {objetivo.completado ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle
                        className={`text-lg ${objetivo.completado ? "line-through text-gray-500" : "text-gray-800"}`}
                      >
                        {objetivo.nombre}
                      </CardTitle>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {fechaFormateada}
                      </p>
                      {objetivo.descripcion && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{objetivo.descripcion}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-800">${objetivo.monto_ahorrado}</p>
                      <p className="text-sm text-gray-500">de ${objetivo.monto_total}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progreso</span>
                    <span className="font-medium text-gray-800">{progreso.toFixed(1)}%</span>
                  </div>
                  <Progress value={progreso} className="h-3" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Faltan ${objetivo.monto_total - objetivo.monto_ahorrado}</span>
                    <span>{progreso >= 100 ? "¡Completado!" : `${(100 - progreso).toFixed(1)}% restante`}</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  {!objetivo.completado && progreso >= 100 && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        marcarCompletado(objetivo.id)
                      }}
                      className="flex-1 h-8 text-xs bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completado
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      abrirEdicion(objetivo)
                    }}
                    className="flex-1 h-8 text-xs"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 h-8 text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar objetivo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente el objetivo "{objetivo.nombre}
                          ".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => eliminarObjetivo(objetivo.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {objetivos.length === 0 && (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No hay objetivos creados</p>
          <p className="text-sm text-gray-400">¡Crea tu primer objetivo juntos!</p>
        </div>
      )}
    </div>
  )
}
