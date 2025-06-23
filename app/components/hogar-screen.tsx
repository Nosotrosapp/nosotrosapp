"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Home,
  Plus,
  CheckCircle,
  Circle,
  Calendar,
  AlertTriangle,
  Package,
  ShoppingCart,
  Wrench,
  Sparkles,
  ChefHat,
  MoreHorizontal,
  Edit,
  Trash2,
  Minus,
  AlertCircle,
} from "lucide-react"
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

const categoriasTareas = [
  { id: "limpieza", nombre: "Limpieza", icon: Sparkles, color: "bg-blue-100 text-blue-700" },
  { id: "compras", nombre: "Compras", icon: ShoppingCart, color: "bg-green-100 text-green-700" },
  { id: "reparaciones", nombre: "Reparaciones", icon: Wrench, color: "bg-red-100 text-red-700" },
  { id: "mantenimiento", nombre: "Mantenimiento", icon: Home, color: "bg-purple-100 text-purple-700" },
  { id: "cocina", nombre: "Cocina", icon: ChefHat, color: "bg-orange-100 text-orange-700" },
  { id: "otros", nombre: "Otros", icon: MoreHorizontal, color: "bg-gray-100 text-gray-700" },
]

const categoriasInventario = [
  { id: "alimentos", nombre: "Alimentos", icon: ChefHat, color: "bg-green-100 text-green-700" },
  { id: "bebidas", nombre: "Bebidas", icon: Package, color: "bg-blue-100 text-blue-700" },
  { id: "limpieza", nombre: "Limpieza", icon: Sparkles, color: "bg-purple-100 text-purple-700" },
  { id: "higiene", nombre: "Higiene", icon: Home, color: "bg-pink-100 text-pink-700" },
  { id: "medicamentos", nombre: "Medicamentos", icon: AlertTriangle, color: "bg-red-100 text-red-700" },
  { id: "otros", nombre: "Otros", icon: MoreHorizontal, color: "bg-gray-100 text-gray-700" },
]

const prioridades = [
  { id: "baja", nombre: "Baja", color: "bg-gray-100 text-gray-700" },
  { id: "media", nombre: "Media", color: "bg-yellow-100 text-yellow-700" },
  { id: "alta", nombre: "Alta", color: "bg-orange-100 text-orange-700" },
  { id: "urgente", nombre: "Urgente", color: "bg-red-100 text-red-700" },
]

type TareaHogar = {
  id: number
  titulo: string
  descripcion: string
  categoria: string
  prioridad: string
  asignado_a: string
  completada: boolean
  fecha_limite?: string
  fecha_completada?: string
  notas: string
}

type InventarioHogar = {
  id: number
  nombre: string
  categoria: string
  cantidad: number
  unidad: string
  minimo_stock: number
  ubicacion: string
  fecha_vencimiento?: string
  notas: string
}

export default function HogarScreen() {
  const [tareas, setTareas] = useState<TareaHogar[]>([])
  const [inventario, setInventario] = useState<InventarioHogar[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogTareaOpen, setDialogTareaOpen] = useState(false)
  const [dialogInventarioOpen, setDialogInventarioOpen] = useState(false)
  const [editingTarea, setEditingTarea] = useState<TareaHogar | null>(null)
  const [editingInventario, setEditingInventario] = useState<InventarioHogar | null>(null)

  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: "",
    descripcion: "",
    categoria: "limpieza", // Default value set to "limpieza"
    prioridad: "media",
    asignado_a: "none",
    fecha_limite: "",
    notas: "",
  })

  const [nuevoInventario, setNuevoInventario] = useState({
    nombre: "",
    categoria: "alimentos", // Default value set to "alimentos"
    cantidad: "",
    unidad: "unidades",
    minimo_stock: "1",
    ubicacion: "",
    fecha_vencimiento: "",
    notas: "",
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    await Promise.all([cargarTareas(), cargarInventario()])
    setLoading(false)
  }

  const cargarTareas = async () => {
    try {
      const { data, error } = await supabase
        .from("tareas_hogar")
        .select("*")
        .order("completada", { ascending: true })
        .order("prioridad", { ascending: false })

      if (error) throw error
      setTareas(data || [])
    } catch (error) {
      console.error("Error cargando tareas:", error)
    }
  }

  const cargarInventario = async () => {
    try {
      const { data, error } = await supabase.from("inventario_hogar").select("*").order("nombre", { ascending: true })

      if (error) throw error
      setInventario(data || [])
    } catch (error) {
      console.error("Error cargando inventario:", error)
    }
  }

  const agregarTarea = async () => {
    if (nuevaTarea.titulo && nuevaTarea.categoria) {
      try {
        const tareaData = {
          titulo: nuevaTarea.titulo,
          descripcion: nuevaTarea.descripcion,
          categoria: nuevaTarea.categoria,
          prioridad: nuevaTarea.prioridad,
          asignado_a: nuevaTarea.asignado_a === "none" ? null : nuevaTarea.asignado_a,
          completada: false,
          fecha_limite: nuevaTarea.fecha_limite || null,
          notas: nuevaTarea.notas,
        }

        const { error } = await supabase.from("tareas_hogar").insert([tareaData])
        if (error) throw error

        await cargarTareas()
        setNuevaTarea({
          titulo: "",
          descripcion: "",
          categoria: "limpieza", // Default value set to "limpieza"
          prioridad: "media",
          asignado_a: "none",
          fecha_limite: "",
          notas: "",
        })
        setDialogTareaOpen(false)
      } catch (error) {
        console.error("Error agregando tarea:", error)
      }
    }
  }

  const agregarInventario = async () => {
    if (nuevoInventario.nombre && nuevoInventario.categoria && nuevoInventario.cantidad) {
      try {
        const inventarioData = {
          nombre: nuevoInventario.nombre,
          categoria: nuevoInventario.categoria,
          cantidad: Number.parseInt(nuevoInventario.cantidad),
          unidad: nuevoInventario.unidad,
          minimo_stock: Number.parseInt(nuevoInventario.minimo_stock),
          ubicacion: nuevoInventario.ubicacion,
          fecha_vencimiento: nuevoInventario.fecha_vencimiento || null,
          notas: nuevoInventario.notas,
        }

        const { error } = await supabase.from("inventario_hogar").insert([inventarioData])
        if (error) throw error

        await cargarInventario()
        setNuevoInventario({
          nombre: "",
          categoria: "alimentos", // Default value set to "alimentos"
          cantidad: "",
          unidad: "unidades",
          minimo_stock: "1",
          ubicacion: "",
          fecha_vencimiento: "",
          notas: "",
        })
        setDialogInventarioOpen(false)
      } catch (error) {
        console.error("Error agregando inventario:", error)
      }
    }
  }

  const toggleTareaCompletada = async (id: number, completada: boolean) => {
    try {
      const updateData: any = { completada: !completada }
      if (!completada) {
        updateData.fecha_completada = new Date().toISOString().split("T")[0]
      } else {
        updateData.fecha_completada = null
      }

      const { error } = await supabase.from("tareas_hogar").update(updateData).eq("id", id)
      if (error) throw error
      await cargarTareas()
    } catch (error) {
      console.error("Error actualizando tarea:", error)
    }
  }

  const eliminarTarea = async (id: number) => {
    try {
      const { error } = await supabase.from("tareas_hogar").delete().eq("id", id)
      if (error) throw error
      await cargarTareas()
    } catch (error) {
      console.error("Error eliminando tarea:", error)
    }
  }

  const eliminarInventario = async (id: number) => {
    try {
      const { error } = await supabase.from("inventario_hogar").delete().eq("id", id)
      if (error) throw error
      await cargarInventario()
    } catch (error) {
      console.error("Error eliminando inventario:", error)
    }
  }

  const actualizarCantidadInventario = async (id: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 0) return

    try {
      const { error } = await supabase
        .from("inventario_hogar")
        .update({ cantidad: nuevaCantidad, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error
      await cargarInventario()
    } catch (error) {
      console.error("Error actualizando cantidad:", error)
    }
  }

  const getCategoriaInfo = (categoriaId: string, tipo: "tareas" | "inventario") => {
    const categorias = tipo === "tareas" ? categoriasTareas : categoriasInventario
    return categorias.find((cat) => cat.id === categoriaId) || categorias[0]
  }

  const getPrioridadInfo = (prioridadId: string) => {
    return prioridades.find((p) => p.id === prioridadId) || prioridades[1]
  }

  const itemsBajoStock = inventario.filter((item) => item.cantidad <= item.minimo_stock)
  const tareasUrgentes = tareas.filter((tarea) => !tarea.completada && tarea.prioridad === "urgente")
  const tareasVencidas = tareas.filter((tarea) => {
    if (!tarea.fecha_limite || tarea.completada) return false
    return new Date(tarea.fecha_limite) < new Date()
  })

  const editarTarea = async () => {
    if (editingTarea && nuevaTarea.titulo && nuevaTarea.categoria) {
      try {
        const { error } = await supabase
          .from("tareas_hogar")
          .update({
            titulo: nuevaTarea.titulo,
            descripcion: nuevaTarea.descripcion,
            categoria: nuevaTarea.categoria,
            prioridad: nuevaTarea.prioridad,
            asignado_a: nuevaTarea.asignado_a === "none" ? null : nuevaTarea.asignado_a,
            fecha_limite: nuevaTarea.fecha_limite || null,
            notas: nuevaTarea.notas,
          })
          .eq("id", editingTarea.id)

        if (error) throw error

        await cargarTareas()
        setEditingTarea(null)
        setNuevaTarea({
          titulo: "",
          descripcion: "",
          categoria: "limpieza",
          prioridad: "media",
          asignado_a: "none",
          fecha_limite: "",
          notas: "",
        })
        setDialogTareaOpen(false)
      } catch (error) {
        console.error("Error editando tarea:", error)
      }
    }
  }

  const abrirEdicionTarea = (tarea: TareaHogar) => {
    setEditingTarea(tarea)
    setNuevaTarea({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      categoria: tarea.categoria,
      prioridad: tarea.prioridad,
      asignado_a: tarea.asignado_a ?? "none",
      fecha_limite: tarea.fecha_limite || "",
      notas: tarea.notas,
    })
    setDialogTareaOpen(true)
  }

  const cerrarDialogTarea = () => {
    setDialogTareaOpen(false)
    setEditingTarea(null)
    setNuevaTarea({
      titulo: "",
      descripcion: "",
      categoria: "limpieza",
      prioridad: "media",
      asignado_a: "none",
      fecha_limite: "",
      notas: "",
    })
  }

  const abrirEdicionInventario = (item: InventarioHogar) => {
    setEditingInventario(item)
    setNuevoInventario({
      nombre: item.nombre,
      categoria: item.categoria,
      cantidad: item.cantidad.toString(),
      unidad: item.unidad,
      minimo_stock: item.minimo_stock.toString(),
      ubicacion: item.ubicacion,
      fecha_vencimiento: item.fecha_vencimiento || "",
      notas: item.notas,
    })
    setDialogInventarioOpen(true)
  }

  const editarInventario = async () => {
    if (editingInventario && nuevoInventario.nombre && nuevoInventario.categoria && nuevoInventario.cantidad) {
      try {
        const { error } = await supabase
          .from("inventario_hogar")
          .update({
            nombre: nuevoInventario.nombre,
            categoria: nuevoInventario.categoria,
            cantidad: Number.parseInt(nuevoInventario.cantidad),
            unidad: nuevoInventario.unidad,
            minimo_stock: Number.parseInt(nuevoInventario.minimo_stock),
            ubicacion: nuevoInventario.ubicacion,
            fecha_vencimiento: nuevoInventario.fecha_vencimiento || null,
            notas: nuevoInventario.notas,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingInventario.id)

        if (error) throw error

        await cargarInventario()
        setEditingInventario(null)
        setNuevoInventario({
          nombre: "",
          categoria: "alimentos",
          cantidad: "",
          unidad: "unidades",
          minimo_stock: "1",
          ubicacion: "",
          fecha_vencimiento: "",
          notas: "",
        })
        setDialogInventarioOpen(false)
      } catch (error) {
        console.error("Error editando inventario:", error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header del hogar */}
      <Card className="bg-gradient-to-r from-orange-100 to-amber-100 border-none shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-orange-800 flex items-center gap-2 text-lg">
            <Home className="w-5 h-5" />
            Nuestro Hogar
          </CardTitle>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="text-center">
              <p className="text-xl font-bold text-orange-800">{tareas.filter((t) => !t.completada).length}</p>
              <p className="text-xs text-orange-600">Tareas pendientes</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-red-600">{itemsBajoStock.length}</p>
              <p className="text-xs text-orange-600">Bajo stock</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-700">{inventario.length}</p>
              <p className="text-xs text-orange-600">Items inventario</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alertas importantes */}
      {(tareasUrgentes.length > 0 || tareasVencidas.length > 0 || itemsBajoStock.length > 0) && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-800 text-sm">Atención requerida</span>
            </div>
            <div className="space-y-1 text-xs">
              {tareasUrgentes.length > 0 && <p className="text-red-700">• {tareasUrgentes.length} tareas urgentes</p>}
              {tareasVencidas.length > 0 && <p className="text-red-700">• {tareasVencidas.length} tareas vencidas</p>}
              {itemsBajoStock.length > 0 && <p className="text-red-700">• {itemsBajoStock.length} items bajo stock</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs para Tareas e Inventario */}
      <Tabs defaultValue="tareas" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-sm">
          <TabsTrigger value="tareas" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
            📋 Tareas
          </TabsTrigger>
          <TabsTrigger
            value="inventario"
            className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700"
          >
            📦 Inventario
          </TabsTrigger>
        </TabsList>

        {/* TAREAS */}
        <TabsContent value="tareas" className="space-y-4">
          {/* Botón agregar tarea */}
          <Dialog open={dialogTareaOpen} onOpenChange={setDialogTareaOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg h-12">
                <Plus className="w-4 h-4 mr-2" />
                Agregar tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-orange-50 to-amber-50 w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-orange-800">
                  {editingTarea ? "Editar Tarea" : "Nueva Tarea del Hogar"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo" className="text-sm font-medium">
                    Título de la tarea
                  </Label>
                  <Input
                    id="titulo"
                    value={nuevaTarea.titulo}
                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })}
                    placeholder="¿Qué hay que hacer?"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion" className="text-sm font-medium">
                    Descripción
                  </Label>
                  <Textarea
                    id="descripcion"
                    value={nuevaTarea.descripcion}
                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
                    placeholder="Detalles de la tarea..."
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="categoria" className="text-sm font-medium">
                      Categoría
                    </Label>
                    <Select
                      value={nuevaTarea.categoria}
                      onValueChange={(value) => setNuevaTarea({ ...nuevaTarea, categoria: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasTareas.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="prioridad" className="text-sm font-medium">
                      Prioridad
                    </Label>
                    <Select
                      value={nuevaTarea.prioridad}
                      onValueChange={(value) => setNuevaTarea({ ...nuevaTarea, prioridad: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {prioridades.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="asignado_a" className="text-sm font-medium">
                      Asignado a
                    </Label>
                    <Select
                      value={nuevaTarea.asignado_a}
                      onValueChange={(v) => setNuevaTarea({ ...nuevaTarea, asignado_a: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="¿Quién?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin asignar</SelectItem>
                        <SelectItem value="Melina">Melina</SelectItem>
                        <SelectItem value="Tomas">Tomas</SelectItem>
                        <SelectItem value="Ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fecha_limite" className="text-sm font-medium">
                      Fecha límite
                    </Label>
                    <Input
                      id="fecha_limite"
                      type="date"
                      value={nuevaTarea.fecha_limite}
                      onChange={(e) => setNuevaTarea({ ...nuevaTarea, fecha_limite: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notas" className="text-sm font-medium">
                    Notas adicionales
                  </Label>
                  <Textarea
                    id="notas"
                    value={nuevaTarea.notas}
                    onChange={(e) => setNuevaTarea({ ...nuevaTarea, notas: e.target.value })}
                    placeholder="Recordatorios, instrucciones..."
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={cerrarDialogTarea} variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={editingTarea ? editarTarea : agregarTarea}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  >
                    {editingTarea ? "Guardar" : "Agregar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Lista de tareas */}
          <div className="space-y-3">
            {tareas.map((tarea) => {
              const categoriaInfo = getCategoriaInfo(tarea.categoria, "tareas")
              const prioridadInfo = getPrioridadInfo(tarea.prioridad)
              const IconComponent = categoriaInfo.icon
              const esVencida = tarea.fecha_limite && new Date(tarea.fecha_limite) < new Date() && !tarea.completada

              return (
                <Card
                  key={tarea.id}
                  className={`bg-white/90 backdrop-blur-sm shadow-md ${
                    tarea.completada ? "opacity-75" : esVencida ? "border-red-300 bg-red-50" : ""
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTareaCompletada(tarea.id, tarea.completada)}
                        className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          tarea.completada
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-green-400"
                        }`}
                      >
                        {tarea.completada ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`font-medium text-sm ${
                                tarea.completada ? "line-through text-gray-500" : "text-gray-800"
                              }`}
                            >
                              {tarea.titulo}
                            </h4>
                            {tarea.descripcion && <p className="text-xs text-gray-600 mt-1">{tarea.descripcion}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <div className={`p-1 rounded ${categoriaInfo.color}`}>
                              <IconComponent className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`${prioridadInfo.color} text-xs`} variant="secondary">
                              {prioridadInfo.nombre}
                            </Badge>
                            {tarea.asignado_a && (
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  tarea.asignado_a === "Melina"
                                    ? "border-pink-300 text-pink-700"
                                    : tarea.asignado_a === "Tomas"
                                      ? "border-blue-300 text-blue-700"
                                      : "border-purple-300 text-purple-700"
                                }`}
                              >
                                {tarea.asignado_a}
                              </Badge>
                            )}
                            {tarea.fecha_limite && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span className={esVencida ? "text-red-600 font-medium" : ""}>
                                  {new Date(tarea.fecha_limite).toLocaleDateString("es-ES")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {tarea.notas && <p className="text-xs text-gray-500 mt-2 italic">"{tarea.notas}"</p>}

                        <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => abrirEdicionTarea(tarea)}
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
                                <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente la tarea "
                                  {tarea.titulo}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => eliminarTarea(tarea.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {tareas.length === 0 && (
            <div className="text-center py-8">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No hay tareas registradas</p>
              <p className="text-sm text-gray-400">¡Agrega tu primera tarea del hogar!</p>
            </div>
          )}
        </TabsContent>

        {/* INVENTARIO */}
        <TabsContent value="inventario" className="space-y-4">
          {/* Botón agregar inventario */}
          <Dialog open={dialogInventarioOpen} onOpenChange={setDialogInventarioOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg h-12">
                <Plus className="w-4 h-4 mr-2" />
                Agregar al inventario
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-amber-50 to-yellow-50 w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-amber-800">
                  {editingInventario ? "Editar Item" : "Nuevo Item del Inventario"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre" className="text-sm font-medium">
                    Nombre del producto
                  </Label>
                  <Input
                    id="nombre"
                    value={nuevoInventario.nombre}
                    onChange={(e) => setNuevoInventario({ ...nuevoInventario, nombre: e.target.value })}
                    placeholder="¿Qué producto es?"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="categoria" className="text-sm font-medium">
                      Categoría
                    </Label>
                    <Select
                      value={nuevoInventario.categoria}
                      onValueChange={(value) => setNuevoInventario({ ...nuevoInventario, categoria: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasInventario.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ubicacion" className="text-sm font-medium">
                      Ubicación
                    </Label>
                    <Input
                      id="ubicacion"
                      value={nuevoInventario.ubicacion}
                      onChange={(e) => setNuevoInventario({ ...nuevoInventario, ubicacion: e.target.value })}
                      placeholder="¿Dónde está?"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="cantidad" className="text-sm font-medium">
                      Cantidad
                    </Label>
                    <Input
                      id="cantidad"
                      type="number"
                      value={nuevoInventario.cantidad}
                      onChange={(e) => setNuevoInventario({ ...nuevoInventario, cantidad: e.target.value })}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="unidad" className="text-sm font-medium">
                      Unidad
                    </Label>
                    <Select
                      value={nuevoInventario.unidad}
                      onValueChange={(value) => setNuevoInventario({ ...nuevoInventario, unidad: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unidades">unidades</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="litros">litros</SelectItem>
                        <SelectItem value="paquetes">paquetes</SelectItem>
                        <SelectItem value="botellas">botellas</SelectItem>
                        <SelectItem value="rollos">rollos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="minimo_stock" className="text-sm font-medium">
                      Mín. stock
                    </Label>
                    <Input
                      id="minimo_stock"
                      type="number"
                      value={nuevoInventario.minimo_stock}
                      onChange={(e) => setNuevoInventario({ ...nuevoInventario, minimo_stock: e.target.value })}
                      placeholder="1"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fecha_vencimiento" className="text-sm font-medium">
                    Fecha de vencimiento (opcional)
                  </Label>
                  <Input
                    id="fecha_vencimiento"
                    type="date"
                    value={nuevoInventario.fecha_vencimiento}
                    onChange={(e) => setNuevoInventario({ ...nuevoInventario, fecha_vencimiento: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="notas" className="text-sm font-medium">
                    Notas
                  </Label>
                  <Textarea
                    id="notas"
                    value={nuevoInventario.notas}
                    onChange={(e) => setNuevoInventario({ ...nuevoInventario, notas: e.target.value })}
                    placeholder="Marca, observaciones..."
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => setDialogInventarioOpen(false)} variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={editingInventario ? editarInventario : agregarInventario}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                  >
                    {editingInventario ? "Guardar" : "Agregar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Lista de inventario */}
          <div className="space-y-3">
            {inventario.map((item) => {
              const categoriaInfo = getCategoriaInfo(item.categoria, "inventario")
              const IconComponent = categoriaInfo.icon
              const esBajoStock = item.cantidad <= item.minimo_stock
              const estaVencido = item.fecha_vencimiento && new Date(item.fecha_vencimiento) < new Date()
              const vencePronto =
                item.fecha_vencimiento &&
                new Date(item.fecha_vencimiento) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

              return (
                <Card
                  key={item.id}
                  className={`bg-white/90 backdrop-blur-sm shadow-md ${
                    esBajoStock || estaVencido
                      ? "border-red-300 bg-red-50"
                      : vencePronto
                        ? "border-yellow-300 bg-yellow-50"
                        : ""
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded ${categoriaInfo.color} flex-shrink-0`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-800 text-sm truncate">{item.nombre}</h4>
                          <div className="text-xs text-gray-500 space-y-1">
                            {item.ubicacion && <p>📍 {item.ubicacion}</p>}
                            {item.fecha_vencimiento && (
                              <p
                                className={
                                  estaVencido ? "text-red-600 font-medium" : vencePronto ? "text-yellow-600" : ""
                                }
                              >
                                🗓️ Vence: {new Date(item.fecha_vencimiento).toLocaleDateString("es-ES")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actualizarCantidadInventario(item.id, item.cantidad - 1)}
                            disabled={item.cantidad <= 0}
                            className="h-7 w-7 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <div className="text-center min-w-[60px]">
                            <p className={`font-bold text-sm ${esBajoStock ? "text-red-600" : "text-gray-800"}`}>
                              {item.cantidad}
                            </p>
                            <p className="text-xs text-gray-500">{item.unidad}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actualizarCantidadInventario(item.id, item.cantidad + 1)}
                            className="h-7 w-7 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`${categoriaInfo.color} text-xs`} variant="secondary">
                          {categoriaInfo.nombre}
                        </Badge>
                        {esBajoStock && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Bajo stock
                          </Badge>
                        )}
                        {estaVencido && (
                          <Badge variant="destructive" className="text-xs">
                            Vencido
                          </Badge>
                        )}
                        {vencePronto && !estaVencido && (
                          <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-700">
                            Vence pronto
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Mín: {item.minimo_stock}</p>
                    </div>

                    {item.notas && <p className="text-xs text-gray-500 mt-2 italic">"{item.notas}"</p>}

                    <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirEdicionInventario(item)}
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
                            <AlertDialogTitle>¿Eliminar del inventario?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente "{item.nombre}" del
                              inventario.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => eliminarInventario(item.id)}
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

          {inventario.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No hay items en el inventario</p>
              <p className="text-sm text-gray-400">¡Agrega tu primer producto!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
