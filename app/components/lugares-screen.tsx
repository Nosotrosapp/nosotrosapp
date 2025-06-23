"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  MapPin,
  Coffee,
  UtensilsCrossed,
  Building,
  Hotel,
  TreePine,
  Plus,
  Star,
  Heart,
  Search,
  Edit,
  Trash2,
  Globe,
  Navigation,
  Camera,
  Music,
  Gamepad2,
  ShoppingBag,
  Dumbbell,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

const iconosDisponibles = [
  { id: "coffee", icon: Coffee, nombre: "Café" },
  { id: "utensils", icon: UtensilsCrossed, nombre: "Restaurante" },
  { id: "building", icon: Building, nombre: "Edificio" },
  { id: "hotel", icon: Hotel, nombre: "Hotel" },
  { id: "tree", icon: TreePine, nombre: "Naturaleza" },
  { id: "camera", icon: Camera, nombre: "Turismo" },
  { id: "music", icon: Music, nombre: "Entretenimiento" },
  { id: "gamepad", icon: Gamepad2, nombre: "Diversión" },
  { id: "shopping", icon: ShoppingBag, nombre: "Compras" },
  { id: "dumbbell", icon: Dumbbell, nombre: "Deporte" },
  { id: "map", icon: MapPin, nombre: "Ubicación" },
]

export default function LugaresScreen() {
  const [categorias, setCategorias] = useState([
    { id: "cafe", nombre: "Cafés", icon: Coffee, color: "bg-teal-100 text-teal-700" },
    { id: "restaurante", nombre: "Restaurantes", icon: UtensilsCrossed, color: "bg-cyan-100 text-cyan-700" },
    { id: "pueblo", nombre: "Pueblos", icon: Building, color: "bg-slate-100 text-slate-700" },
    { id: "hotel", nombre: "Hoteles", icon: Hotel, color: "bg-indigo-100 text-indigo-700" },
    { id: "paseo", nombre: "Paseos", icon: TreePine, color: "bg-emerald-100 text-emerald-700" },
  ])
  const [dialogCategoriaOpen, setDialogCategoriaOpen] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    color: "bg-teal-100 text-teal-700",
    icono: "map",
  })

  const [lugares, setLugares] = useState([])
  const [loading, setLoading] = useState(true)

  // Filtros jerárquicos
  const [filtroPais, setFiltroPais] = useState("todos")
  const [filtroCiudad, setFiltroCiudad] = useState("todas")
  const [filtroBarrio, setFiltroBarrio] = useState("todos")
  const [filtroCategoria, setFiltroCategoria] = useState("todas")
  const [busqueda, setBusqueda] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLugar, setEditingLugar] = useState(null)
  const [nuevoLugar, setNuevoLugar] = useState({
    nombre: "",
    categoria: "",
    ciudad: "",
    pais: "Argentina",
    barrio: "",
    direccion: "",
    notas: "",
    puntaje: 5,
    visitado: false,
  })

  useEffect(() => {
    cargarLugares()
  }, [])

  const cargarLugares = async () => {
    try {
      const { data, error } = await supabase.from("lugares").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setLugares(data || [])
    } catch (error) {
      console.error("Error cargando lugares:", error)
    } finally {
      setLoading(false)
    }
  }

  const agregarLugar = async () => {
    if (nuevoLugar.nombre && nuevoLugar.categoria && nuevoLugar.ciudad) {
      try {
        const lugarData = {
          nombre: nuevoLugar.nombre,
          categoria: nuevoLugar.categoria,
          ciudad: nuevoLugar.ciudad,
          pais: nuevoLugar.pais,
          barrio: nuevoLugar.barrio,
          direccion: nuevoLugar.direccion,
          notas: nuevoLugar.notas,
          puntaje: nuevoLugar.puntaje,
          visitado: nuevoLugar.visitado,
        }

        const { error } = await supabase.from("lugares").insert([lugarData])

        if (error) throw error

        await cargarLugares()
        setNuevoLugar({
          nombre: "",
          categoria: "",
          ciudad: "",
          pais: "Argentina",
          barrio: "",
          direccion: "",
          notas: "",
          puntaje: 5,
          visitado: false,
        })
        setDialogOpen(false)
      } catch (error) {
        console.error("Error agregando lugar:", error)
      }
    }
  }

  const editarLugar = async () => {
    if (editingLugar && nuevoLugar.nombre && nuevoLugar.categoria && nuevoLugar.ciudad) {
      try {
        const { error } = await supabase
          .from("lugares")
          .update({
            nombre: nuevoLugar.nombre,
            categoria: nuevoLugar.categoria,
            ciudad: nuevoLugar.ciudad,
            pais: nuevoLugar.pais,
            barrio: nuevoLugar.barrio,
            direccion: nuevoLugar.direccion,
            notas: nuevoLugar.notas,
            puntaje: nuevoLugar.puntaje,
            visitado: nuevoLugar.visitado,
          })
          .eq("id", editingLugar.id)

        if (error) throw error

        await cargarLugares()
        setEditingLugar(null)
        setNuevoLugar({
          nombre: "",
          categoria: "",
          ciudad: "",
          pais: "Argentina",
          barrio: "",
          direccion: "",
          notas: "",
          puntaje: 5,
          visitado: false,
        })
        setDialogOpen(false)
      } catch (error) {
        console.error("Error editando lugar:", error)
      }
    }
  }

  const eliminarLugar = async (id) => {
    try {
      const { error } = await supabase.from("lugares").delete().eq("id", id)

      if (error) throw error
      await cargarLugares()
    } catch (error) {
      console.error("Error eliminando lugar:", error)
    }
  }

  const abrirEdicion = (lugar) => {
    setEditingLugar(lugar)
    setNuevoLugar({
      nombre: lugar.nombre,
      categoria: lugar.categoria,
      ciudad: lugar.ciudad,
      pais: lugar.pais,
      barrio: lugar.barrio,
      direccion: lugar.direccion,
      notas: lugar.notas,
      puntaje: lugar.puntaje,
      visitado: lugar.visitado,
    })
    setDialogOpen(true)
  }

  const cerrarDialog = () => {
    setDialogOpen(false)
    setEditingLugar(null)
    setNuevoLugar({
      nombre: "",
      categoria: "",
      ciudad: "",
      pais: "Argentina",
      barrio: "",
      direccion: "",
      notas: "",
      puntaje: 5,
      visitado: false,
    })
  }

  // Obtener opciones únicas para filtros
  const paises = [...new Set(lugares.map((lugar) => lugar.pais))].sort()
  const ciudadesFiltradas = lugares
    .filter((lugar) => filtroPais === "todos" || lugar.pais === filtroPais)
    .map((lugar) => lugar.ciudad)
  const ciudades = [...new Set(ciudadesFiltradas)].sort()

  const barriosFiltrados = lugares
    .filter((lugar) => {
      const matchPais = filtroPais === "todos" || lugar.pais === filtroPais
      const matchCiudad = filtroCiudad === "todas" || lugar.ciudad === filtroCiudad
      return matchPais && matchCiudad && lugar.barrio
    })
    .map((lugar) => lugar.barrio)
  const barrios = [...new Set(barriosFiltrados)].sort()

  // Aplicar filtros
  const lugaresFiltrados = lugares.filter((lugar) => {
    const matchPais = filtroPais === "todos" || lugar.pais === filtroPais
    const matchCiudad = filtroCiudad === "todas" || lugar.ciudad === filtroCiudad
    const matchBarrio = filtroBarrio === "todos" || lugar.barrio === filtroBarrio
    const matchCategoria = filtroCategoria === "todas" || lugar.categoria === filtroCategoria
    const matchBusqueda =
      !busqueda ||
      lugar.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      lugar.direccion.toLowerCase().includes(busqueda.toLowerCase()) ||
      lugar.notas.toLowerCase().includes(busqueda.toLowerCase())

    return matchPais && matchCiudad && matchBarrio && matchCategoria && matchBusqueda
  })

  const agregarCategoria = () => {
    if (nuevaCategoria.nombre) {
      const iconoSeleccionado = iconosDisponibles.find((icono) => icono.id === nuevaCategoria.icono)
      const nuevaCat = {
        id: nuevaCategoria.nombre.toLowerCase().replace(/\s+/g, "_"),
        nombre: nuevaCategoria.nombre,
        icon: iconoSeleccionado?.icon || MapPin,
        color: nuevaCategoria.color,
      }
      setCategorias([...categorias, nuevaCat])
      setNuevaCategoria({ nombre: "", color: "bg-teal-100 text-teal-700", icono: "map" })
      setDialogCategoriaOpen(false)
    }
  }

  const getCategoriaInfo = (categoriaId) => {
    return categorias.find((cat) => cat.id === categoriaId) || categorias[0]
  }

  const abrirEnGoogleMaps = (direccion, nombre) => {
    const query = encodeURIComponent(`${nombre}, ${direccion}`)
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`
    window.open(url, "_blank")
  }

  const eliminarCategoria = (categoriaId: string) => {
    // Verificar si hay lugares usando esta categoría
    const lugaresConCategoria = lugares.filter((lugar) => lugar.categoria === categoriaId)
    if (lugaresConCategoria.length > 0) {
      alert(`No se puede eliminar la categoría porque hay ${lugaresConCategoria.length} lugares que la usan.`)
      return
    }

    setCategorias(categorias.filter((cat) => cat.id !== categoriaId))
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
      {/* Mapa simulado */}
      <Card className="bg-gradient-to-br from-teal-100 to-cyan-100 border-none shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-teal-800 flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5" />
            Mapa de Lugares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-teal-200/50 rounded-lg p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-300/20 to-cyan-300/20" />
            <MapPin className="w-10 h-10 text-teal-600 mx-auto mb-2" />
            <p className="text-teal-700 font-medium text-sm">Vista del mapa interactivo</p>
            <p className="text-xs text-teal-600 mt-1">
              {lugaresFiltrados.length} de {lugares.length} lugares
            </p>

            {/* Pines simulados */}
            <div className="absolute top-3 left-6">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <div className="absolute top-8 right-8">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            </div>
            <div className="absolute bottom-6 left-12">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros jerárquicos */}
      <div className="space-y-3">
        {/* Primera fila: País y Ciudad */}
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={filtroPais}
            onValueChange={(value) => {
              setFiltroPais(value)
              setFiltroCiudad("todas")
              setFiltroBarrio("todos")
            }}
          >
            <SelectTrigger className="h-10">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los países</SelectItem>
              {paises.map((pais) => (
                <SelectItem key={pais} value={pais}>
                  {pais}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filtroCiudad}
            onValueChange={(value) => {
              setFiltroCiudad(value)
              setFiltroBarrio("todos")
            }}
          >
            <SelectTrigger className="h-10">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las ciudades</SelectItem>
              {ciudades.map((ciudad) => (
                <SelectItem key={ciudad} value={ciudad}>
                  {ciudad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Segunda fila: Barrio y Categoría */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={filtroBarrio} onValueChange={setFiltroBarrio}>
            <SelectTrigger className="h-10">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los barrios</SelectItem>
              {barrios.map((barrio) => (
                <SelectItem key={barrio} value={barrio}>
                  {barrio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, dirección o notas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
      </div>

      {/* Botón agregar lugar */}
      <div className="grid grid-cols-3 gap-2">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="col-span-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg h-12"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar lugar
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-teal-50 to-cyan-50 w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-teal-800">{editingLugar ? "Editar Lugar" : "Nuevo Lugar"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre" className="text-sm font-medium">
                  Nombre del lugar
                </Label>
                <Input
                  id="nombre"
                  value={nuevoLugar.nombre}
                  onChange={(e) => setNuevoLugar({ ...nuevoLugar, nombre: e.target.value })}
                  placeholder="¿Cómo se llama?"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pais" className="text-sm font-medium">
                    País
                  </Label>
                  <Input
                    id="pais"
                    value={nuevoLugar.pais}
                    onChange={(e) => setNuevoLugar({ ...nuevoLugar, pais: e.target.value })}
                    placeholder="País"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ciudad" className="text-sm font-medium">
                    Ciudad
                  </Label>
                  <Input
                    id="ciudad"
                    value={nuevoLugar.ciudad}
                    onChange={(e) => setNuevoLugar({ ...nuevoLugar, ciudad: e.target.value })}
                    placeholder="Ciudad"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="barrio" className="text-sm font-medium">
                  Barrio
                </Label>
                <Input
                  id="barrio"
                  value={nuevoLugar.barrio}
                  onChange={(e) => setNuevoLugar({ ...nuevoLugar, barrio: e.target.value })}
                  placeholder="Barrio o zona"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="direccion" className="text-sm font-medium">
                  Dirección
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="direccion"
                    value={nuevoLugar.direccion}
                    onChange={(e) => setNuevoLugar({ ...nuevoLugar, direccion: e.target.value })}
                    placeholder="Dirección completa"
                    className="mt-1 flex-1"
                  />
                  {nuevoLugar.direccion && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => abrirEnGoogleMaps(nuevoLugar.direccion, nuevoLugar.nombre || "Ubicación")}
                      className="mt-1 px-3"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="categoria" className="text-sm font-medium">
                  Categoría
                </Label>
                <Select
                  value={nuevoLugar.categoria}
                  onValueChange={(value) => setNuevoLugar({ ...nuevoLugar, categoria: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Tipo de lugar" />
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
                <Label htmlFor="notas" className="text-sm font-medium">
                  Notas personales
                </Label>
                <Textarea
                  id="notas"
                  value={nuevoLugar.notas}
                  onChange={(e) => setNuevoLugar({ ...nuevoLugar, notas: e.target.value })}
                  placeholder="¿Qué los enamoró de este lugar?"
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="puntaje" className="text-sm font-medium">
                  Puntaje (1-5 estrellas)
                </Label>
                <Select
                  value={nuevoLugar.puntaje.toString()}
                  onValueChange={(value) => setNuevoLugar({ ...nuevoLugar, puntaje: Number.parseInt(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {"⭐".repeat(num)} ({num})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="visitado"
                  checked={nuevoLugar.visitado}
                  onChange={(e) => setNuevoLugar({ ...nuevoLugar, visitado: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="visitado" className="text-sm">
                  ¿Ya fuimos a este lugar?
                </Label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={cerrarDialog} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={editingLugar ? editarLugar : agregarLugar}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  {editingLugar ? "Guardar" : "Agregar"}
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
              <DialogTitle className="text-teal-800">Gestionar Categorías de Lugares</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Lista de categorías existentes */}
              <div>
                <Label className="text-sm font-medium">Categorías existentes</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {categorias.map((cat) => {
                    const lugaresConCategoria = lugares.filter((lugar) => lugar.categoria === cat.id).length
                    return (
                      <div key={cat.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${cat.color}`}>
                            <cat.icon className="w-3 h-3" />
                          </div>
                          <div>
                            <span className="text-sm font-medium">{cat.nombre}</span>
                            {lugaresConCategoria > 0 && (
                              <span className="text-xs text-gray-500 ml-2">({lugaresConCategoria} lugares)</span>
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
                                {lugaresConCategoria > 0
                                  ? `No se puede eliminar "${cat.nombre}" porque hay ${lugaresConCategoria} lugares que la usan. Primero cambia esos lugares a otra categoría.`
                                  : `Esta acción eliminará permanentemente la categoría "${cat.nombre}".`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              {lugaresConCategoria === 0 && (
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
                  placeholder="Ej: Bares, Museos, Parques..."
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
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  Agregar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de lugares */}
      <div className="space-y-3">
        {lugaresFiltrados.map((lugar) => {
          const categoriaInfo = getCategoriaInfo(lugar.categoria)
          const IconComponent = categoriaInfo.icon

          return (
            <Card key={lugar.id} className="bg-white/90 backdrop-blur-sm shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-full ${categoriaInfo.color} flex-shrink-0`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">{lugar.nombre}</h3>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {lugar.barrio ? `${lugar.barrio}, ` : ""}
                          {lugar.ciudad}, {lugar.pais}
                        </p>
                        {lugar.direccion && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              abrirEnGoogleMaps(lugar.direccion, lugar.nombre)
                            }}
                            className="text-xs text-blue-500 hover:text-blue-700 underline text-left w-full"
                          >
                            <span className="block truncate">📍 {lugar.direccion}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < lugar.puntaje ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    {lugar.visitado && <Heart className="w-3 h-3 text-red-500 fill-red-500" />}
                  </div>
                </div>

                {lugar.notas && <p className="text-xs text-gray-600 mb-2 italic">"{lugar.notas}"</p>}

                <div className="flex justify-between items-center mb-3">
                  <Badge
                    variant={lugar.visitado ? "default" : "secondary"}
                    className={`text-xs ${lugar.visitado ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                  >
                    {lugar.visitado ? "✓ Ya fuimos" : "○ Queremos ir"}
                  </Badge>
                  <Badge variant="outline" className={`${categoriaInfo.color} text-xs`}>
                    {categoriaInfo.nombre}
                  </Badge>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => abrirEdicion(lugar)}
                    className="flex-1 h-8 text-xs"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      abrirEnGoogleMaps(lugar.direccion || `${lugar.nombre}, ${lugar.ciudad}`, lugar.nombre)
                    }}
                    className="flex-1 h-8 text-xs text-blue-600 hover:text-blue-700"
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    Maps
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
                        <AlertDialogTitle>¿Eliminar lugar?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente el lugar "{lugar.nombre}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => eliminarLugar(lugar.id)}
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

      {lugaresFiltrados.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No hay lugares que coincidan</p>
          <p className="text-xs text-gray-400">Prueba con otros filtros</p>
        </div>
      )}
    </div>
  )
}
