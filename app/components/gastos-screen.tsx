"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Coffee,
  Home,
  Gift,
  Car,
  ShoppingBag,
  DollarSign,
  Edit,
  Trash2,
  Scale,
  ChevronLeft,
  ChevronRight,
  History,
  ArrowLeft,
  Utensils,
  Gamepad2,
  Heart,
  Briefcase,
  Zap,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

const iconosDisponibles = [
  { id: "coffee", icon: Coffee, nombre: "Café" },
  { id: "home", icon: Home, nombre: "Casa" },
  { id: "gift", icon: Gift, nombre: "Regalo" },
  { id: "car", icon: Car, nombre: "Auto" },
  { id: "shopping", icon: ShoppingBag, nombre: "Compras" },
  { id: "dollar", icon: DollarSign, nombre: "Dinero" },
  { id: "utensils", icon: Utensils, nombre: "Comida" },
  { id: "gamepad", icon: Gamepad2, nombre: "Entretenimiento" },
  { id: "heart", icon: Heart, nombre: "Salud" },
  { id: "briefcase", icon: Briefcase, nombre: "Trabajo" },
  { id: "zap", icon: Zap, nombre: "Servicios" },
]

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

type Gasto = {
  id: number
  descripcion: string
  monto: number
  categoria: string
  pagado_por: string
  fecha: string
}

// ─── Totales mensuales que ahora llegan de la view materializada ───
type ResumenMes = {
  año: number          // ej. 2025
  mes: number          // 0-index (0=Ene, 6=Jul)
  total_gastos: number
  gastos_melina: number
  gastos_tomas: number
  cantidad_gastos: number
}

export default function GastosScreen() {
  const [categorias, setCategorias] = useState([
    { id: "comida", nombre: "Comida", icon: Coffee, color: "bg-teal-100 text-teal-700" },
    { id: "alquiler", nombre: "Alquiler", icon: Home, color: "bg-cyan-100 text-cyan-700" },
    { id: "regalo", nombre: "Regalo", icon: Gift, color: "bg-pink-100 text-pink-700" },
    { id: "transporte", nombre: "Transporte", icon: Car, color: "bg-slate-100 text-slate-700" },
    { id: "compras", nombre: "Compras", icon: ShoppingBag, color: "bg-indigo-100 text-indigo-700" },
  ])
    // DEBUG navegación meses
  console.log({
    vistaHistorial,
    mesSeleccionado,
    fechaActual: fechaActual.toISOString().slice(0,10),
    esMesActual
  })

  const [dialogCategoriaOpen, setDialogCategoriaOpen] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    color: "bg-teal-100 text-teal-700",
    icono: "dollar",
  })
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null)
  const [fechaActual, setFechaActual] = useState(new Date())
  const [vistaHistorial, setVistaHistorial] = useState(false)
  const [mesSeleccionado, setMesSeleccionado] = useState<{ año: number; mes: number } | null>(null)
  const [resumenMeses, setResumenMeses] = useState<ResumenMes[]>([])
  const [nuevoGasto, setNuevoGasto] = useState({
    descripcion: "",
    monto: "",
    categoria: "",
    pagado_por: "",
  })

  // Cargar gastos desde Supabase
  useEffect(() => {
    cargarGastos()
    cargarResumenMeses()
  }, [])

  // Actualizar `fechaActual` SOLO si el sistema pasó a un nuevo mes
useEffect(() => {
  const interval = setInterval(() => {
    const ahora = new Date()

    const cambioMes =
      ahora.getUTCFullYear() !== fechaActual.getUTCFullYear() ||
      ahora.getUTCMonth() !== fechaActual.getUTCMonth()

    // Solo pisamos si cambió realmente el mes
    if (cambioMes) {
      setFechaActual(ahora)
    }
  }, 60_000) // 1 minuto

  return () => clearInterval(interval)
}, [fechaActual])


  const cargarGastos = async () => {
    try {
      const { data, error } = await supabase.from("gastos").select("*").order("fecha", { ascending: false })

      if (error) throw error
      setGastos(data || [])
    } catch (error) {
      console.error("Error cargando gastos:", error)
    } finally {
      setLoading(false)
    }
  }

  const cargarResumenMeses = async () => {
  try {
    const { data, error } = await supabase
      .from("resumen_mensual")                 // ← la view
      .select("*")
      .order("año", { ascending: false })
      .order("mes", { ascending: false })

    if (error) throw error

    const resumen = data as ResumenMes[]

    // ── aseguro que el mes activo exista aunque no tenga gastos ──
    const añoA = fechaActual.getUTCFullYear()
    const mesA = fechaActual.getUTCMonth()
    if (!resumen.some(r => r.año === añoA && r.mes === mesA)) {
      resumen.push({
        año: añoA,
        mes: mesA,
        total_gastos: 0,
        gastos_melina: 0,
        gastos_tomas: 0,
        cantidad_gastos: 0,
      })
    }

    setResumenMeses(resumen)
  } catch (err) {
    console.error("Error cargando resumen mensual:", err)
  }
}


  





  const eliminarMesCompleto = async (año: number, mes: number) => {
    try {
      // Obtener primer y último día del mes
      const primerDia = new Date(año, mes, 1).toISOString().split("T")[0]
      const ultimoDia = new Date(año, mes + 1, 0).toISOString().split("T")[0]

      const { error } = await supabase.from("gastos").delete().gte("fecha", primerDia).lte("fecha", ultimoDia)

      if (error) throw error

      await cargarGastos()
      await cargarResumenMeses()

      // Si estábamos viendo ese mes, volver al historial
      if (mesSeleccionado && mesSeleccionado.año === año && mesSeleccionado.mes === mes) {
        setMesSeleccionado(null)
      }
    } catch (error) {
      console.error("Error eliminando mes:", error)
    }
  }

  const agregarGasto = async () => {
    if (nuevoGasto.descripcion && nuevoGasto.monto && nuevoGasto.categoria && nuevoGasto.pagado_por) {
      try {
        const gastoData = {
          descripcion: nuevoGasto.descripcion,
          monto: Number.parseFloat(nuevoGasto.monto),
          categoria: nuevoGasto.categoria,
          pagado_por: nuevoGasto.pagado_por,
          fecha: fechaActual.toISOString().split("T")[0],
        }

        const { error } = await supabase.from("gastos").insert([gastoData])

        if (error) throw error

        await cargarGastos()
        await cargarResumenMeses()
        setNuevoGasto({ descripcion: "", monto: "", categoria: "", pagado_por: "" })
        setDialogOpen(false)
      } catch (error) {
        console.error("Error agregando gasto:", error)
      }
    }
  }

  const editarGasto = async () => {
    if (editingGasto && nuevoGasto.descripcion && nuevoGasto.monto && nuevoGasto.categoria && nuevoGasto.pagado_por) {
      try {
        const { error } = await supabase
          .from("gastos")
          .update({
            descripcion: nuevoGasto.descripcion,
            monto: Number.parseFloat(nuevoGasto.monto),
            categoria: nuevoGasto.categoria,
            pagado_por: nuevoGasto.pagado_por,
          })
          .eq("id", editingGasto.id)

        if (error) throw error

        await cargarGastos()
        await cargarResumenMeses()
        setEditingGasto(null)
        setNuevoGasto({ descripcion: "", monto: "", categoria: "", pagado_por: "" })
        setDialogOpen(false)
      } catch (error) {
        console.error("Error editando gasto:", error)
      }
    }
  }

  const eliminarGasto = async (id: number) => {
    try {
      const { error } = await supabase.from("gastos").delete().eq("id", id)

      if (error) throw error
      await cargarGastos()
      await cargarResumenMeses()
    } catch (error) {
      console.error("Error eliminando gasto:", error)
    }
  }

  const abrirEdicion = (gasto: Gasto) => {
    setEditingGasto(gasto)
    setNuevoGasto({
      descripcion: gasto.descripcion,
      monto: gasto.monto.toString(),
      categoria: gasto.categoria,
      pagado_por: gasto.pagado_por,
    })
    setDialogOpen(true)
  }

  const cerrarDialog = () => {
    setDialogOpen(false)
    setEditingGasto(null)
    setNuevoGasto({ descripcion: "", monto: "", categoria: "", pagado_por: "" })
  }

  const cambiarMes = (direccion: number) => {
    const nuevaFecha = new Date(fechaActual)
    nuevaFecha.setMonth(nuevaFecha.getUTCMonth() + direccion)
    setFechaActual(nuevaFecha)
  }

  const verDetallesMes = (año: number, mes: number) => {
    setMesSeleccionado({ año, mes })
    setVistaHistorial(false)
  }

  const volverAlHistorial = () => {
    setMesSeleccionado(null)
    setVistaHistorial(true)
  }

  const volverAMesActual = () => {
    setVistaHistorial(false)
    setMesSeleccionado(null)
    setFechaActual(new Date())
  }

  // Obtener gastos del mes actual o seleccionado
  const obtenerGastosDelMes = () => {
    const fecha = mesSeleccionado ? new Date(mesSeleccionado.año, mesSeleccionado.mes) : fechaActual
    const año = fecha.getUTCFullYear()
    const mes = fecha.getUTCMonth()

    return gastos.filter((gasto) => {
      const fechaGasto = new Date(gasto.fecha)
      return fechaGasto.getUTCFullYear() === año && fechaGasto.getUTCMonth() === mes
    })
  }

  const gastosDelMes = obtenerGastosDelMes()
  const gastos_melina = gastosDelMes.filter((g) => g.pagado_por === "Melina").reduce((sum, g) => sum + g.monto, 0)
  const gastos_tomas = gastosDelMes.filter((g) => g.pagado_por === "Tomas").reduce((sum, g) => sum + g.monto, 0)
  const totalMesActual = gastos_melina + gastos_tomas
  const balance = gastos_melina - gastos_tomas

  const getCategoriaInfo = (categoriaId: string) => {
    return categorias.find((cat) => cat.id === categoriaId) || categorias[0]
  }

  const agregarCategoria = () => {
    if (nuevaCategoria.nombre) {
      const iconoSeleccionado = iconosDisponibles.find((icono) => icono.id === nuevaCategoria.icono)
      const nuevaCat = {
        id: nuevaCategoria.nombre.toLowerCase().replace(/\s+/g, "_"),
        nombre: nuevaCategoria.nombre,
        icon: iconoSeleccionado?.icon || DollarSign,
        color: nuevaCategoria.color,
      }
      setCategorias([...categorias, nuevaCat])
      setNuevaCategoria({ nombre: "", color: "bg-teal-100 text-teal-700", icono: "dollar" })
      setDialogCategoriaOpen(false)
    }
  }

  const eliminarCategoria = (categoriaId: string) => {
    // Verificar si hay gastos usando esta categoría
    const gastosConCategoria = gastos.filter((gasto) => gasto.categoria === categoriaId)
    if (gastosConCategoria.length > 0) {
      alert(`No se puede eliminar la categoría porque hay ${gastosConCategoria.length} gastos que la usan.`)
      return
    }

    setCategorias(categorias.filter((cat) => cat.id !== categoriaId))
  }

  const handleCardClick = (año: number, mes: number, event: React.MouseEvent) => {
    // Si el click fue en un botón o elemento interactivo, no abrir el detalle
    const target = event.target as HTMLElement
    if (target.closest("button") || target.closest('[role="button"]')) {
      return
    }
    verDetallesMes(año, mes)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  // Vista del historial de meses
  if (vistaHistorial) {
    return (
      <div className="space-y-4">
        {/* Header del historial */}
        <Card className="bg-gradient-to-r from-teal-100 to-cyan-100 border-none shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={volverAMesActual} className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Button>
                <div>
                  <CardTitle className="text-teal-800 flex items-center gap-2 text-lg">
                    <History className="w-5 h-5" />
                    Historial de Gastos
                  </CardTitle>
                  <p className="text-sm text-teal-600">Todos los meses registrados</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Lista de meses */}
        <div className="space-y-3">
          {resumenMeses.map((resumen) => (
            <Card
              key={`${resumen.año}-${resumen.mes}`}
              className="bg-white/90 backdrop-blur-sm shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={(e) => handleCardClick(resumen.año, resumen.mes, e)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {meses[resumen.mes]} {resumen.año}
                    </h3>
                    <p className="text-sm text-gray-600">{resumen.cantidad_gastos} gastos registrados</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">${resumen.total_gastos}</p>
                    <p className="text-sm text-gray-600">Total gastado</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-pink-700">${resumen.gastos_melina}</p>
                    <p className="text-xs text-gray-600">Melina</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-blue-700">${resumen.gastos_tomas}</p>
                    <p className="text-xs text-gray-600">Tomas</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Balance: ${Math.abs(resumen.gastos_melina - resumen.gastos_tomas)}
                      {resumen.gastos_melina > resumen.gastos_tomas
                        ? " (Tomas debe)"
                        : resumen.gastos_tomas > resumen.gastos_melina
                          ? " (Melina debe)"
                          : " (Parejos)"}
                    </span>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => e.stopPropagation()}
                        className="text-red-600 hover:text-red-700 border-red-300"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Eliminar mes
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar mes completo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará permanentemente todos los gastos de {meses[resumen.mes]} {resumen.año} (
                          {resumen.cantidad_gastos} gastos). Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => eliminarMesCompleto(resumen.año, resumen.mes)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Eliminar mes
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {resumenMeses.length === 0 && (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No hay historial de gastos</p>
            <p className="text-sm text-gray-400">Los gastos aparecerán aquí cuando agregues algunos</p>
          </div>
        )}
      </div>
    )
  }

 // Vista de detalle de un mes específico o mes actual
const fechaMostrar = mesSeleccionado
  ? new Date(mesSeleccionado.año, mesSeleccionado.mes)
  : fechaActual

// 👉 línea corregida
const esMesActual =
  fechaMostrar.getUTCFullYear() === new Date().getUTCFullYear() &&
  fechaMostrar.getUTCMonth() === new Date().getUTCMonth()


  return (
    <div className="space-y-4">
      {/* Resumen mensual - Mobile First */}
      <Card className="bg-gradient-to-r from-teal-100 to-cyan-100 border-none shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {mesSeleccionado && (
                <Button variant="outline" size="sm" onClick={volverAlHistorial} className="h-8 w-8 p-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <CardTitle className="text-teal-800 flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5" />
                {meses[fechaMostrar.getUTCMonth()]} {fechaMostrar.getUTCFullYear()}
                {esMesActual && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs ml-2">
                    Actual
                  </Badge>
                )}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {esMesActual && (
                <>
                  <Button variant="outline" size="sm" onClick={() => cambiarMes(-1)} className="h-8 w-8 p-0">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => cambiarMes(1)} className="h-8 w-8 p-0">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setVistaHistorial(true)} className="h-8 px-3">
                <History className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-teal-900">${totalMesActual}</p>
              <p className="text-sm text-teal-600">Total gastado</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Scale className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-700">Balance</span>
              </div>
              <p
                className={`text-lg font-bold ${balance > 0 ? "text-green-600" : balance < 0 ? "text-red-600" : "text-gray-600"}`}
              >
                ${Math.abs(balance)}
              </p>
              <p className="text-xs text-teal-600">
                {balance > 0 ? "Tomas debe a Melina" : balance < 0 ? "Melina debe a Tomas" : "Están parejos"}
              </p>
            </div>
          </div>

          {/* Gastos individuales */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-teal-200">
            <div className="text-center">
              <p className="text-lg font-semibold text-teal-800">${gastos_melina}</p>
              <p className="text-xs text-teal-600">Melina</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-teal-800">${gastos_tomas}</p>
              <p className="text-xs text-teal-600">Tomas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón agregar gasto - Solo en mes actual */}
      {esMesActual && (
        <div className="grid grid-cols-3 gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="col-span-2 bg-teal-500 hover:bg-teal-600 text-white shadow-lg h-12"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar nuevo gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-teal-50 to-cyan-50 w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle className="text-teal-800">{editingGasto ? "Editar Gasto" : "Nuevo Gasto"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="descripcion" className="text-sm font-medium">
                    Descripción
                  </Label>
                  <Input
                    id="descripcion"
                    value={nuevoGasto.descripcion}
                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })}
                    placeholder="¿En qué gastaron?"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="monto" className="text-sm font-medium">
                    Monto
                  </Label>
                  <Input
                    id="monto"
                    type="number"
                    value={nuevoGasto.monto}
                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, monto: e.target.value })}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="categoria" className="text-sm font-medium">
                    Categoría
                  </Label>
                  <Select
                    value={nuevoGasto.categoria}
                    onValueChange={(value) => setNuevoGasto({ ...nuevoGasto, categoria: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pagadoPor" className="text-sm font-medium">
                    ¿Quién pagó?
                  </Label>
                  <Select
                    value={nuevoGasto.pagado_por}
                    onValueChange={(value) => setNuevoGasto({ ...nuevoGasto, pagado_por: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona quién pagó" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Melina">Melina</SelectItem>
                      <SelectItem value="Tomas">Tomas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={cerrarDialog} variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={editingGasto ? editarGasto : agregarGasto}
                    className="flex-1 bg-teal-500 hover:bg-teal-600"
                  >
                    {editingGasto ? "Guardar" : "Agregar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogCategoriaOpen} onOpenChange={setDialogCategoriaOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-teal-200 text-teal-700 hover:bg-teal-50 h-12"
                onClick={() => setDialogCategoriaOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Categorías
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-teal-50 to-cyan-50 w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-teal-800">Gestionar Categorías de Gastos</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Lista de categorías existentes */}
                <div>
                  <Label className="text-sm font-medium">Categorías existentes</Label>
                  <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                    {categorias.map((cat) => {
                      const gastosConCategoria = gastos.filter((gasto) => gasto.categoria === cat.id).length
                      return (
                        <div key={cat.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${cat.color}`}>
                              <cat.icon className="w-3 h-3" />
                            </div>
                            <div>
                              <span className="text-sm font-medium">{cat.nombre}</span>
                              {gastosConCategoria > 0 && (
                                <span className="text-xs text-gray-500 ml-2">({gastosConCategoria} gastos)</span>
                              )}
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600 hover:text-red-700">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {gastosConCategoria > 0
                                    ? `No se puede eliminar "${cat.nombre}" porque hay ${gastosConCategoria} gastos que la usan. Primero cambia esos gastos a otra categoría.`
                                    : `Esta acción eliminará permanentemente la categoría "${cat.nombre}".`}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                {gastosConCategoria === 0 && (
                                  <AlertDialogAction
                                    onClick={() => eliminarCategoria(cat.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                )}
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Agregar nueva categoría */}
                <div className="border-t pt-4">
                  <Label htmlFor="nombreCategoria" className="text-sm font-medium">
                    Nueva categoría
                  </Label>
                  <Input
                    id="nombreCategoria"
                    value={nuevaCategoria.nombre}
                    onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })}
                    placeholder="Ej: Entretenimiento, Salud..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="iconoCategoria" className="text-sm font-medium">
                    Icono
                  </Label>
                  <Select
                    value={nuevaCategoria.icono}
                    onValueChange={(value) => setNuevaCategoria({ ...nuevaCategoria, icono: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconosDisponibles.map((icono) => (
                        <SelectItem key={icono.id} value={icono.id}>
                          <div className="flex items-center gap-2">
                            <icono.icon className="w-4 h-4" />
                            {icono.nombre}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="colorCategoria" className="text-sm font-medium">
                    Color
                  </Label>
                  <Select
                    value={nuevaCategoria.color}
                    onValueChange={(value) => setNuevaCategoria({ ...nuevaCategoria, color: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg-teal-100 text-teal-700">🟢 Verde Teal</SelectItem>
                      <SelectItem value="bg-cyan-100 text-cyan-700">🔵 Azul Cyan</SelectItem>
                      <SelectItem value="bg-purple-100 text-purple-700">🟣 Morado</SelectItem>
                      <SelectItem value="bg-pink-100 text-pink-700">🩷 Rosa</SelectItem>
                      <SelectItem value="bg-orange-100 text-orange-700">🟠 Naranja</SelectItem>
                      <SelectItem value="bg-yellow-100 text-yellow-700">🟡 Amarillo</SelectItem>
                      <SelectItem value="bg-red-100 text-red-700">🔴 Rojo</SelectItem>
                      <SelectItem value="bg-emerald-100 text-emerald-700">💚 Verde Esmeralda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => setDialogCategoriaOpen(false)} variant="outline" className="flex-1">
                    Cerrar
                  </Button>
                  <Button
                    onClick={agregarCategoria}
                    disabled={!nuevaCategoria.nombre}
                    className="flex-1 bg-teal-500 hover:bg-teal-600"
                  >
                    Agregar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Lista de gastos */}
      <div className="space-y-3">
        {gastosDelMes.map((gasto) => {
          const categoriaInfo = getCategoriaInfo(gasto.categoria)
          const IconComponent = categoriaInfo.icon

          return (
            <Card key={gasto.id} className="bg-white/90 backdrop-blur-sm shadow-md">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-full ${categoriaInfo.color} flex-shrink-0`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 text-sm truncate">{gasto.descripcion}</p>
                      <p className="text-xs text-gray-500">{gasto.fecha}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="font-bold text-gray-900 text-sm">${gasto.monto}</p>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        gasto.pagado_por === "Melina" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {gasto.pagado_por}
                    </Badge>
                  </div>
                </div>

                {/* Botones de acción - Solo en mes actual */}
                {esMesActual && (
                  <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirEdicion(gasto)}
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
                          className="flex-1 h-8 text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar gasto?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el gasto "{gasto.descripcion}
                            ".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => eliminarGasto(gasto.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {gastosDelMes.length === 0 && (
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No hay gastos registrados en este mes</p>
          {esMesActual && <p className="text-sm text-gray-400">¡Agrega tu primer gasto!</p>}
        </div>
      )}
    </div>
  )
}
