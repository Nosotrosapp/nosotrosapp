"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Plus,
  Calendar,
  DollarSign,
  Target,
  User,
  TrendingUp,
  MapPin,
  Star,
  CheckCircle,
  Edit,
  Trash2,
  FileText,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

type Objetivo = {
  id: number
  nombre: string
  descripcion: string
  monto_total: number
  monto_ahorrado: number
  fecha_objetivo: string
  completado: boolean
}

type Aporte = {
  id: number
  objetivo_id: number
  monto: number
  persona: string
  fecha: string
  notas: string
  created_at: string
}

type MiniObjetivo = {
  id: number
  objetivo_id: number
  nombre: string
  descripcion: string
  precio: number
  ubicacion: string
  completado: boolean
  prioridad: number
}

type ObjetivoDetalleProps = {
  objetivo: Objetivo
  onClose: () => void
}

export default function ObjetivoDetalle({ objetivo, onClose }: ObjetivoDetalleProps) {
  const [aportes, setAportes] = useState<Aporte[]>([])
  const [miniObjetivos, setMiniObjetivos] = useState<MiniObjetivo[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogAporteOpen, setDialogAporteOpen] = useState(false)
  const [dialogMiniOpen, setDialogMiniOpen] = useState(false)
  const [dialogDescripcionOpen, setDialogDescripcionOpen] = useState(false)
  const [editingMini, setEditingMini] = useState<MiniObjetivo | null>(null)
  const [objetivoActual, setObjetivoActual] = useState(objetivo)
  const [nuevaDescripcion, setNuevaDescripcion] = useState(objetivo.descripcion || "")
  const [nuevoAporte, setNuevoAporte] = useState({
    monto: "",
    persona: "",
    notas: "",
  })
  const [nuevoMini, setNuevoMini] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    ubicacion: "",
    prioridad: 3,
  })

  useEffect(() => {
    cargarDatos()
  }, [objetivo.id])

  const cargarDatos = async () => {
    await Promise.all([cargarAportes(), cargarMiniObjetivos(), cargarObjetivoActualizado()])
    setLoading(false)
  }

  const cargarAportes = async () => {
    try {
      const { data, error } = await supabase
        .from("aportes_objetivos")
        .select("*")
        .eq("objetivo_id", objetivo.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setAportes(data || [])
    } catch (error) {
      console.error("Error cargando aportes:", error)
      setAportes([])
    }
  }

  const cargarMiniObjetivos = async () => {
    try {
      const { data, error } = await supabase
        .from("mini_objetivos")
        .select("*")
        .eq("objetivo_id", objetivo.id)
        .order("prioridad", { ascending: false })

      if (error) throw error
      setMiniObjetivos(data || [])
    } catch (error) {
      console.error("Error cargando mini objetivos:", error)
      setMiniObjetivos([])
    }
  }

  const cargarObjetivoActualizado = async () => {
    try {
      const { data, error } = await supabase.from("objetivos").select("*").eq("id", objetivo.id).maybeSingle()

      if (error) throw error
      if (data) {
        setObjetivoActual(data)
        setNuevaDescripcion(data.descripcion || "")
      }
    } catch (error) {
      console.error("Error cargando objetivo actualizado:", error)
    }
  }

  const actualizarDescripcion = async () => {
    try {
      const { error } = await supabase.from("objetivos").update({ descripcion: nuevaDescripcion }).eq("id", objetivo.id)

      if (error) throw error

      await cargarObjetivoActualizado()
      setDialogDescripcionOpen(false)
    } catch (error) {
      console.error("Error actualizando descripción:", error)
    }
  }

  const agregarAporte = async () => {
    if (nuevoAporte.monto && nuevoAporte.persona) {
      try {
        const montoAporte = Number.parseFloat(nuevoAporte.monto)

        const { error: aporteError } = await supabase.from("aportes_objetivos").insert([
          {
            objetivo_id: objetivo.id,
            monto: montoAporte,
            persona: nuevoAporte.persona,
            fecha: new Date().toISOString().split("T")[0],
            notas: nuevoAporte.notas,
          },
        ])
        if (aporteError) throw aporteError

        // Actualizar el monto ahorrado del objetivo
        const nuevoMontoAhorrado = objetivoActual.monto_ahorrado + montoAporte
        const { error: objetivoError } = await supabase
          .from("objetivos")
          .update({ monto_ahorrado: nuevoMontoAhorrado })
          .eq("id", objetivo.id)

        if (objetivoError) throw objetivoError

        await cargarDatos()
        setNuevoAporte({ monto: "", persona: "", notas: "" })
        setDialogAporteOpen(false)
      } catch (error) {
        console.error("Error agregando aporte:", error)
      }
    }
  }

  const agregarMiniObjetivo = async () => {
    if (nuevoMini.nombre && nuevoMini.precio) {
      try {
        const miniData = {
          objetivo_id: objetivo.id,
          nombre: nuevoMini.nombre,
          descripcion: nuevoMini.descripcion,
          precio: Number.parseFloat(nuevoMini.precio),
          ubicacion: nuevoMini.ubicacion,
          prioridad: nuevoMini.prioridad,
          completado: false,
        }

        const { error } = await supabase.from("mini_objetivos").insert([miniData])
        if (error) throw error

        await cargarMiniObjetivos()
        setNuevoMini({ nombre: "", descripcion: "", precio: "", ubicacion: "", prioridad: 3 })
        setDialogMiniOpen(false)
      } catch (error) {
        console.error("Error agregando mini objetivo:", error)
      }
    }
  }

  const editarMiniObjetivo = async () => {
    if (editingMini && nuevoMini.nombre && nuevoMini.precio) {
      try {
        const { error } = await supabase
          .from("mini_objetivos")
          .update({
            nombre: nuevoMini.nombre,
            descripcion: nuevoMini.descripcion,
            precio: Number.parseFloat(nuevoMini.precio),
            ubicacion: nuevoMini.ubicacion,
            prioridad: nuevoMini.prioridad,
          })
          .eq("id", editingMini.id)

        if (error) throw error

        await cargarMiniObjetivos()
        setEditingMini(null)
        setNuevoMini({ nombre: "", descripcion: "", precio: "", ubicacion: "", prioridad: 3 })
        setDialogMiniOpen(false)
      } catch (error) {
        console.error("Error editando mini objetivo:", error)
      }
    }
  }

  const eliminarMiniObjetivo = async (id: number) => {
    try {
      const { error } = await supabase.from("mini_objetivos").delete().eq("id", id)
      if (error) throw error
      await cargarMiniObjetivos()
    } catch (error) {
      console.error("Error eliminando mini objetivo:", error)
    }
  }

  const toggleCompletadoMini = async (id: number, completado: boolean) => {
    try {
      const { error } = await supabase.from("mini_objetivos").update({ completado: !completado }).eq("id", id)
      if (error) throw error
      await cargarMiniObjetivos()
    } catch (error) {
      console.error("Error actualizando mini objetivo:", error)
    }
  }

  const abrirEdicionMini = (mini: MiniObjetivo) => {
    setEditingMini(mini)
    setNuevoMini({
      nombre: mini.nombre,
      descripcion: mini.descripcion,
      precio: mini.precio.toString(),
      ubicacion: mini.ubicacion,
      prioridad: mini.prioridad,
    })
    setDialogMiniOpen(true)
  }

  const cerrarDialogMini = () => {
    setDialogMiniOpen(false)
    setEditingMini(null)
    setNuevoMini({ nombre: "", descripcion: "", precio: "", ubicacion: "", prioridad: 3 })
  }

  const progreso = (objetivoActual.monto_ahorrado / objetivoActual.monto_total) * 100
  const fechaFormateada = new Date(objetivoActual.fecha_objetivo).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const diasRestantes = Math.ceil(
    (new Date(objetivoActual.fecha_objetivo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  )

  const totalMiniObjetivos = miniObjetivos.reduce((sum, mini) => sum + mini.precio, 0)
  const miniCompletados = miniObjetivos.filter((mini) => mini.completado).length

  const getPrioridadColor = (prioridad: number) => {
    switch (prioridad) {
      case 5:
        return "bg-red-100 text-red-700"
      case 4:
        return "bg-orange-100 text-orange-700"
      case 3:
        return "bg-yellow-100 text-yellow-700"
      case 2:
        return "bg-blue-100 text-blue-700"
      case 1:
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getPrioridadTexto = (prioridad: number) => {
    switch (prioridad) {
      case 5:
        return "Crítica"
      case 4:
        return "Alta"
      case 3:
        return "Media"
      case 2:
        return "Baja"
      case 1:
        return "Opcional"
      default:
        return "Media"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con botón volver */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="outline" size="sm" onClick={onClose} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <h2 className="text-lg font-semibold text-gray-800 truncate">{objetivoActual.nombre}</h2>
      </div>

      {/* Card principal del objetivo */}
      <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 border-none shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-cyan-100 to-teal-100 text-teal-700">
              <Target className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl text-gray-800">{objetivoActual.nombre}</CardTitle>

              {/* Descripción con botón de editar */}
              <div className="mt-2">
                {objetivoActual.descripcion ? (
                  <div className="flex items-start gap-2">
                    <p className="text-sm text-gray-600 flex-1">{objetivoActual.descripcion}</p>
                    <Dialog open={dialogDescripcionOpen} onOpenChange={setDialogDescripcionOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gradient-to-br from-cyan-50 to-teal-50 w-[95vw] max-w-md mx-auto">
                        <DialogHeader>
                          <DialogTitle className="text-cyan-800">Editar Descripción</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="descripcion" className="text-sm font-medium">
                              Descripción del objetivo
                            </Label>
                            <Textarea
                              id="descripcion"
                              value={nuevaDescripcion}
                              onChange={(e) => setNuevaDescripcion(e.target.value)}
                              placeholder="Describe este objetivo, qué incluye, por qué es importante..."
                              rows={4}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => setDialogDescripcionOpen(false)}
                              variant="outline"
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={actualizarDescripcion}
                              className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                            >
                              Guardar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <Dialog open={dialogDescripcionOpen} onOpenChange={setDialogDescripcionOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-gray-500 hover:text-gray-700 text-xs mt-1"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Agregar descripción
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-cyan-50 to-teal-50 w-[95vw] max-w-md mx-auto">
                      <DialogHeader>
                        <DialogTitle className="text-cyan-800">Agregar Descripción</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="descripcion" className="text-sm font-medium">
                            Descripción del objetivo
                          </Label>
                          <Textarea
                            id="descripcion"
                            value={nuevaDescripcion}
                            onChange={(e) => setNuevaDescripcion(e.target.value)}
                            placeholder="Describe este objetivo, qué incluye, por qué es importante..."
                            rows={4}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button onClick={() => setDialogDescripcionOpen(false)} variant="outline" className="flex-1">
                            Cancelar
                          </Button>
                          <Button
                            onClick={actualizarDescripcion}
                            className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                          >
                            Guardar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {fechaFormateada}
                </span>
                <span className={`flex items-center gap-1 ${diasRestantes < 0 ? "text-red-600" : "text-gray-600"}`}>
                  {diasRestantes < 0 ? `${Math.abs(diasRestantes)} días pasados` : `${diasRestantes} días restantes`}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progreso */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-800">${objetivoActual.monto_ahorrado}</span>
              <span className="text-lg text-gray-600">de ${objetivoActual.monto_total}</span>
            </div>
            <Progress value={progreso} className="h-4" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{progreso.toFixed(1)}% completado</span>
              <span>Faltan ${objetivoActual.monto_total - objetivoActual.monto_ahorrado}</span>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-cyan-200">
            <div className="text-center">
              <p className="text-xl font-bold text-teal-600">{aportes.length}</p>
              <p className="text-xs text-gray-600">Aportes</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-cyan-600">{miniObjetivos.length}</p>
              <p className="text-xs text-gray-600">Actividades</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-600">${totalMiniObjetivos}</p>
              <p className="text-xs text-gray-600">Total actividades</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="grid grid-cols-2 gap-3">
        <Dialog open={dialogAporteOpen} onOpenChange={setDialogAporteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg h-12">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Aporte
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-teal-50 to-cyan-50 w-[95vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-teal-800">Nuevo Aporte</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="monto" className="text-sm font-medium">
                  Monto del aporte
                </Label>
                <Input
                  id="monto"
                  type="number"
                  value={nuevoAporte.monto}
                  onChange={(e) => setNuevoAporte({ ...nuevoAporte, monto: e.target.value })}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="persona" className="text-sm font-medium">
                  ¿Quién aporta?
                </Label>
                <Select
                  value={nuevoAporte.persona}
                  onValueChange={(value) => setNuevoAporte({ ...nuevoAporte, persona: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona quién aporta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Melina">Melina</SelectItem>
                    <SelectItem value="Tomas">Tomas</SelectItem>
                    <SelectItem value="Ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notas" className="text-sm font-medium">
                  Notas (opcional)
                </Label>
                <Textarea
                  id="notas"
                  value={nuevoAporte.notas}
                  onChange={(e) => setNuevoAporte({ ...nuevoAporte, notas: e.target.value })}
                  placeholder="¿De dónde viene este aporte?"
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => setDialogAporteOpen(false)} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={agregarAporte}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  Agregar Aporte
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogMiniOpen} onOpenChange={setDialogMiniOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-teal-200 text-teal-700 hover:bg-teal-50 h-12"
              onClick={() => setDialogMiniOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Actividad
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-teal-50 to-cyan-50 w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-teal-800">
                {editingMini ? "Editar Actividad" : "Nueva Actividad"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre" className="text-sm font-medium">
                  Nombre de la actividad
                </Label>
                <Input
                  id="nombre"
                  value={nuevoMini.nombre}
                  onChange={(e) => setNuevoMini({ ...nuevoMini, nombre: e.target.value })}
                  placeholder="¿Qué actividad quieren hacer?"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="descripcion" className="text-sm font-medium">
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  value={nuevoMini.descripcion}
                  onChange={(e) => setNuevoMini({ ...nuevoMini, descripcion: e.target.value })}
                  placeholder="Detalles de la actividad..."
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="precio" className="text-sm font-medium">
                  Precio estimado
                </Label>
                <Input
                  id="precio"
                  type="number"
                  value={nuevoMini.precio}
                  onChange={(e) => setNuevoMini({ ...nuevoMini, precio: e.target.value })}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ubicacion" className="text-sm font-medium">
                  Ubicación
                </Label>
                <Input
                  id="ubicacion"
                  value={nuevoMini.ubicacion}
                  onChange={(e) => setNuevoMini({ ...nuevoMini, ubicacion: e.target.value })}
                  placeholder="¿Dónde es esta actividad?"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="prioridad" className="text-sm font-medium">
                  Prioridad
                </Label>
                <Select
                  value={nuevoMini.prioridad.toString()}
                  onValueChange={(value) => setNuevoMini({ ...nuevoMini, prioridad: Number.parseInt(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ Crítica</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ Alta</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ Media</SelectItem>
                    <SelectItem value="2">⭐⭐ Baja</SelectItem>
                    <SelectItem value="1">⭐ Opcional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={cerrarDialogMini} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={editingMini ? editarMiniObjetivo : agregarMiniObjetivo}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  {editingMini ? "Guardar" : "Agregar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de actividades/mini-objetivos */}
      {miniObjetivos.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Actividades Planificadas ({miniCompletados}/{miniObjetivos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {miniObjetivos.map((mini) => (
                <div
                  key={mini.id}
                  className={`p-3 rounded-lg border ${mini.completado ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleCompletadoMini(mini.id, mini.completado)}
                        className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          mini.completado
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-green-400"
                        }`}
                      >
                        {mini.completado && <CheckCircle className="w-3 h-3" />}
                      </button>
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${mini.completado ? "line-through text-gray-500" : "text-gray-800"}`}
                        >
                          {mini.nombre}
                        </h4>
                        {mini.descripcion && <p className="text-sm text-gray-600 mt-1">{mini.descripcion}</p>}
                        {mini.ubicacion && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {mini.ubicacion}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPrioridadColor(mini.prioridad)} variant="secondary">
                        {getPrioridadTexto(mini.prioridad)}
                      </Badge>
                      <span className="font-bold text-gray-800">${mini.precio}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirEdicionMini(mini)}
                      className="flex-1 h-7 text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-7 text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente la actividad "{mini.nombre}
                            ".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => eliminarMiniObjetivo(mini.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de aportes */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Historial de Aportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aportes.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No hay aportes registrados</p>
              <p className="text-sm text-gray-400">¡Agrega tu primer aporte!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aportes.map((aporte) => (
                <div key={aporte.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-teal-100 text-teal-700">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">${aporte.monto}</p>
                      <p className="text-sm text-gray-500">{aporte.persona}</p>
                      {aporte.notas && <p className="text-xs text-gray-400 italic">"{aporte.notas}"</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{aporte.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
