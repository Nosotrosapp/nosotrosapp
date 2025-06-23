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
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Activity,
  Dumbbell,
  Home,
  Building,
  PartyPopper,
  Users,
  Stethoscope,
  Filter,
  Clock,
  MapPin,
  Edit,
  Trash2,
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
import GoogleAuth from "./google-auth"

const tiposEvento = [
  { id: "actividad", nombre: "Actividad", icon: Activity, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "deporte", nombre: "Deporte", icon: Activity, color: "bg-green-100 text-green-700 border-green-200" },
  { id: "gimnasio", nombre: "Gimnasio", icon: Dumbbell, color: "bg-red-100 text-red-700 border-red-200" },
  { id: "home_office", nombre: "Home Office", icon: Home, color: "bg-purple-100 text-purple-700 border-purple-200" },
  {
    id: "trabajo_presencial",
    nombre: "Trabajo Presencial",
    icon: Building,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  { id: "evento", nombre: "Evento", icon: PartyPopper, color: "bg-pink-100 text-pink-700 border-pink-200" },
  { id: "compromiso", nombre: "Compromiso", icon: Users, color: "bg-orange-100 text-orange-700 border-orange-200" },
  {
    id: "cita_medica",
    nombre: "Cita Médica",
    icon: Stethoscope,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
]

type EventoCalendario = {
  id: number
  titulo: string
  descripcion: string
  tipo: string
  persona: string
  fecha_inicio: string
  fecha_fin?: string
  hora_inicio?: string
  hora_fin?: string
  ubicacion: string
  notas: string
  color: string
}

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

const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

export default function CalendarioScreen() {
  const [eventos, setEventos] = useState<EventoCalendario[]>([])
  const [loading, setLoading] = useState(true)
  const [fechaActual, setFechaActual] = useState(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvento, setEditingEvento] = useState<EventoCalendario | null>(null)
  const [filtroPersona, setFiltroPersona] = useState("todos")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: "",
    descripcion: "",
    tipo: "",
    persona: "",
    fecha_inicio: "",
    fecha_fin: "",
    hora_inicio: "",
    hora_fin: "",
    ubicacion: "",
    notas: "",
  })
  const [usuario, setUsuario] = useState<any>(null)

  useEffect(() => {
    cargarEventos()
  }, [])

  const cargarEventos = async () => {
    try {
      const { data, error } = await supabase
        .from("eventos_calendario")
        .select("*")
        .order("fecha_inicio", { ascending: true })

      if (error) throw error
      setEventos(data || [])
    } catch (error) {
      console.error("Error cargando eventos:", error)
    } finally {
      setLoading(false)
    }
  }

  const agregarEvento = async () => {
    if (nuevoEvento.titulo && nuevoEvento.tipo && nuevoEvento.persona && nuevoEvento.fecha_inicio) {
      try {
        const tipoInfo = tiposEvento.find((t) => t.id === nuevoEvento.tipo)
        const eventoData = {
          titulo: nuevoEvento.titulo,
          descripcion: nuevoEvento.descripcion,
          tipo: nuevoEvento.tipo,
          persona: nuevoEvento.persona,
          fecha_inicio: nuevoEvento.fecha_inicio,
          fecha_fin: nuevoEvento.fecha_fin || null,
          hora_inicio: nuevoEvento.hora_inicio || null,
          hora_fin: nuevoEvento.hora_fin || null,
          ubicacion: nuevoEvento.ubicacion,
          notas: nuevoEvento.notas,
          color: tipoInfo?.color.split(" ")[0].replace("bg-", "#") || "#14b8a6",
        }

        const { error } = await supabase.from("eventos_calendario").insert([eventoData])
        if (error) throw error

        await cargarEventos()
        setNuevoEvento({
          titulo: "",
          descripcion: "",
          tipo: "",
          persona: "",
          fecha_inicio: "",
          fecha_fin: "",
          hora_inicio: "",
          hora_fin: "",
          ubicacion: "",
          notas: "",
        })
        setDialogOpen(false)
      } catch (error) {
        console.error("Error agregando evento:", error)
      }
    }
  }

  const editarEvento = async () => {
    if (editingEvento && nuevoEvento.titulo && nuevoEvento.tipo && nuevoEvento.persona && nuevoEvento.fecha_inicio) {
      try {
        const tipoInfo = tiposEvento.find((t) => t.id === nuevoEvento.tipo)
        const { error } = await supabase
          .from("eventos_calendario")
          .update({
            titulo: nuevoEvento.titulo,
            descripcion: nuevoEvento.descripcion,
            tipo: nuevoEvento.tipo,
            persona: nuevoEvento.persona,
            fecha_inicio: nuevoEvento.fecha_inicio,
            fecha_fin: nuevoEvento.fecha_fin || null,
            hora_inicio: nuevoEvento.hora_inicio || null,
            hora_fin: nuevoEvento.hora_fin || null,
            ubicacion: nuevoEvento.ubicacion,
            notas: nuevoEvento.notas,
            color: tipoInfo?.color.split(" ")[0].replace("bg-", "#") || "#14b8a6",
          })
          .eq("id", editingEvento.id)

        if (error) throw error

        await cargarEventos()
        setEditingEvento(null)
        setNuevoEvento({
          titulo: "",
          descripcion: "",
          tipo: "",
          persona: "",
          fecha_inicio: "",
          fecha_fin: "",
          hora_inicio: "",
          hora_fin: "",
          ubicacion: "",
          notas: "",
        })
        setDialogOpen(false)
      } catch (error) {
        console.error("Error editando evento:", error)
      }
    }
  }

  const eliminarEvento = async (id: number) => {
    try {
      const { error } = await supabase.from("eventos_calendario").delete().eq("id", id)
      if (error) throw error
      await cargarEventos()
    } catch (error) {
      console.error("Error eliminando evento:", error)
    }
  }

  const abrirEdicion = (evento: EventoCalendario) => {
    setEditingEvento(evento)
    setNuevoEvento({
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      tipo: evento.tipo,
      persona: evento.persona,
      fecha_inicio: evento.fecha_inicio,
      fecha_fin: evento.fecha_fin || "",
      hora_inicio: evento.hora_inicio || "",
      hora_fin: evento.hora_fin || "",
      ubicacion: evento.ubicacion,
      notas: evento.notas,
    })
    setDialogOpen(true)
  }

  const cerrarDialog = () => {
    setDialogOpen(false)
    setEditingEvento(null)
    setNuevoEvento({
      titulo: "",
      descripcion: "",
      tipo: "",
      persona: "",
      fecha_inicio: "",
      fecha_fin: "",
      hora_inicio: "",
      hora_fin: "",
      ubicacion: "",
      notas: "",
    })
  }

  const eliminarEventoDesdeModal = async () => {
    if (editingEvento) {
      await eliminarEvento(editingEvento.id)
      cerrarDialog()
    }
  }

  const cambiarMes = (direccion: number) => {
    const nuevaFecha = new Date(fechaActual)
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion)
    setFechaActual(nuevaFecha)
  }

  const obtenerDiasDelMes = () => {
    const año = fechaActual.getFullYear()
    const mes = fechaActual.getMonth()
    const primerDia = new Date(año, mes, 1)
    const ultimoDia = new Date(año, mes + 1, 0)
    const diasEnMes = ultimoDia.getDate()
    const diaSemanaInicio = primerDia.getDay()

    const dias = []

    // Días del mes anterior para completar la primera semana
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const fecha = new Date(año, mes, -i)
      dias.push({ fecha, esDelMesActual: false })
    }

    // Días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(año, mes, dia)
      dias.push({ fecha, esDelMesActual: true })
    }

    // Días del mes siguiente para completar la última semana
    const diasRestantes = 42 - dias.length // 6 semanas × 7 días
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fecha = new Date(año, mes + 1, dia)
      dias.push({ fecha, esDelMesActual: false })
    }

    return dias
  }

  const obtenerEventosDelDia = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split("T")[0]
    return eventos.filter((evento) => {
      const matchFecha = evento.fecha_inicio === fechaStr
      const matchPersona = filtroPersona === "todos" || evento.persona === filtroPersona || evento.persona === "Ambos"
      const matchTipo = filtroTipo === "todos" || evento.tipo === filtroTipo
      // Filtrar por usuario logueado si está conectado
      const matchUsuario = !usuario || evento.persona === usuario.nombre || evento.persona === "Ambos"
      return matchFecha && matchPersona && matchTipo && matchUsuario
    })
  }

  const getTipoInfo = (tipoId: string) => {
    return tiposEvento.find((tipo) => tipo.id === tipoId) || tiposEvento[0]
  }

  const esHoy = (fecha: Date) => {
    const hoy = new Date()
    return fecha.toDateString() === hoy.toDateString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header del calendario */}
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-none shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-200 text-purple-700">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-purple-800 text-lg">
                  {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
                </CardTitle>
                <p className="text-sm text-purple-600">Calendario compartido</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => cambiarMes(-1)} className="h-8 w-8 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => cambiarMes(1)} className="h-8 w-8 p-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Autenticación Google Calendar */}
      <GoogleAuth onUsuarioChange={setUsuario} />

      {/* Filtros */}
      <div className="grid grid-cols-2 gap-3">
        <Select value={filtroPersona} onValueChange={setFiltroPersona}>
          <SelectTrigger className="h-10">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Melina">Melina</SelectItem>
            <SelectItem value="Tomas">Tomas</SelectItem>
            <SelectItem value="Ambos">Ambos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            {tiposEvento.map((tipo) => (
              <SelectItem key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Botón agregar evento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg h-12"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar evento
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gradient-to-br from-purple-50 to-pink-50 w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-purple-800">{editingEvento ? "Editar Evento" : "Nuevo Evento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo" className="text-sm font-medium">
                Título del evento
              </Label>
              <Input
                id="titulo"
                value={nuevoEvento.titulo}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, titulo: e.target.value })}
                placeholder="¿Qué van a hacer?"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tipo" className="text-sm font-medium">
                  Tipo de evento
                </Label>
                <Select
                  value={nuevoEvento.tipo}
                  onValueChange={(value) => setNuevoEvento({ ...nuevoEvento, tipo: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEvento.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="persona" className="text-sm font-medium">
                  ¿Quién?
                </Label>
                <Select
                  value={nuevoEvento.persona}
                  onValueChange={(value) => setNuevoEvento({ ...nuevoEvento, persona: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Persona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Melina">Melina</SelectItem>
                    <SelectItem value="Tomas">Tomas</SelectItem>
                    <SelectItem value="Ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="fecha_inicio" className="text-sm font-medium">
                Fecha
              </Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={nuevoEvento.fecha_inicio}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha_inicio: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hora_inicio" className="text-sm font-medium">
                  Hora inicio
                </Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={nuevoEvento.hora_inicio}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, hora_inicio: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hora_fin" className="text-sm font-medium">
                  Hora fin
                </Label>
                <Input
                  id="hora_fin"
                  type="time"
                  value={nuevoEvento.hora_fin}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, hora_fin: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ubicacion" className="text-sm font-medium">
                Ubicación
              </Label>
              <Input
                id="ubicacion"
                value={nuevoEvento.ubicacion}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, ubicacion: e.target.value })}
                placeholder="¿Dónde es?"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="descripcion" className="text-sm font-medium">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                value={nuevoEvento.descripcion}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })}
                placeholder="Detalles del evento..."
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notas" className="text-sm font-medium">
                Notas adicionales
              </Label>
              <Textarea
                id="notas"
                value={nuevoEvento.notas}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, notas: e.target.value })}
                placeholder="Recordatorios, preparativos..."
                rows={2}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={cerrarDialog} variant="outline" className="flex-1">
                Cancelar
              </Button>
              {editingEvento && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700 border-red-300">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente el evento "{nuevoEvento.titulo}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={eliminarEventoDesdeModal} className="bg-red-500 hover:bg-red-600">
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button
                onClick={editingEvento ? editarEvento : agregarEvento}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {editingEvento ? "Guardar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vista del calendario */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-3">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {diasSemana.map((dia) => (
              <div key={dia} className="text-center text-xs font-medium text-gray-600 py-2">
                {dia}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {obtenerDiasDelMes().map((diaInfo, index) => {
              const eventosDelDia = obtenerEventosDelDia(diaInfo.fecha)
              const esHoyDia = esHoy(diaInfo.fecha)

              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-1 border rounded-lg ${
                    diaInfo.esDelMesActual
                      ? esHoyDia
                        ? "bg-purple-100 border-purple-300"
                        : "bg-white border-gray-200"
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <div
                    className={`text-xs font-medium mb-1 ${
                      diaInfo.esDelMesActual ? (esHoyDia ? "text-purple-700" : "text-gray-800") : "text-gray-400"
                    }`}
                  >
                    {diaInfo.fecha.getDate()}
                  </div>
                  <div className="space-y-1">
                    {eventosDelDia.slice(0, 2).map((evento) => {
                      const tipoInfo = getTipoInfo(evento.tipo)
                      return (
                        <div
                          key={evento.id}
                          className={`text-xs p-1 rounded ${tipoInfo.color} cursor-pointer hover:opacity-80 overflow-hidden`}
                          onClick={() => abrirEdicion(evento)}
                        >
                          <div className="truncate font-medium text-xs leading-tight">{evento.titulo}</div>
                          {evento.hora_inicio && (
                            <div className="text-xs opacity-75 truncate leading-tight">
                              {evento.hora_inicio.slice(0, 5)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {eventosDelDia.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">+{eventosDelDia.length - 2}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de eventos próximos */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Próximos Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {eventos
              .filter((evento) => {
                const fechaEvento = new Date(evento.fecha_inicio)
                const hoy = new Date()
                hoy.setHours(0, 0, 0, 0)
                const matchPersona =
                  filtroPersona === "todos" || evento.persona === filtroPersona || evento.persona === "Ambos"
                const matchTipo = filtroTipo === "todos" || evento.tipo === filtroTipo
                return fechaEvento >= hoy && matchPersona && matchTipo
              })
              .slice(0, 5)
              .map((evento) => {
                const tipoInfo = getTipoInfo(evento.tipo)
                const IconComponent = tipoInfo.icon
                const fechaFormateada = new Date(evento.fecha_inicio).toLocaleDateString("es-ES", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })

                return (
                  <div key={evento.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${tipoInfo.color} flex-shrink-0`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate text-sm">{evento.titulo}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{fechaFormateada}</span>
                          {evento.hora_inicio && (
                            <>
                              <span>•</span>
                              <span>{evento.hora_inicio.slice(0, 5)}</span>
                            </>
                          )}
                        </div>
                        {evento.ubicacion && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{evento.ubicacion}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              evento.persona === "Melina"
                                ? "bg-pink-100 text-pink-700"
                                : evento.persona === "Tomas"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {evento.persona}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirEdicion(evento)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente el evento "
                                    {evento.titulo}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => eliminarEvento(evento.id)}
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
                    </div>
                  </div>
                )
              })}
          </div>

          {eventos.filter((evento) => {
            const fechaEvento = new Date(evento.fecha_inicio)
            const hoy = new Date()
            hoy.setHours(0, 0, 0, 0)
            const matchPersona =
              filtroPersona === "todos" || evento.persona === filtroPersona || evento.persona === "Ambos"
            const matchTipo = filtroTipo === "todos" || evento.tipo === filtroTipo
            return fechaEvento >= hoy && matchPersona && matchTipo
          }).length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No hay eventos próximos</p>
              <p className="text-sm text-gray-400">¡Agrega tu primer evento!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
