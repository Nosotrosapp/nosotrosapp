"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Target, MapPin, Calendar, Home } from "lucide-react"
import { useState } from "react"
import GastosScreen from "./components/gastos-screen"
import ObjetivosScreen from "./components/objetivos-screen"
import LugaresScreen from "./components/lugares-screen"
import CalendarioScreen from "./components/calendario-screen"
import HogarScreen from "./components/hogar-screen"
import Image from "next/image"

export default function NosotrosApp() {
  const [showUauu, setShowUauu] = useState(false)

  const handleLogoClick = () => {
    setShowUauu(true)
    setTimeout(() => setShowUauu(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <div className="container mx-auto px-3 py-4 max-w-sm sm:max-w-md">
        {/* Header Mobile First */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              onClick={handleLogoClick}
              className="relative w-12 h-12 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <Image src="/tiki-logo.jpeg" alt="Tiki Logo" fill className="object-cover" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-teal-800">Nosotros</h1>
          </div>
          <p className="text-teal-600 text-sm">Melina & Tomas - Juntos en cada paso</p>

          {/* Mensaje Uauu Uauu */}
          {showUauu && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 shadow-2xl animate-bounce">
                <p className="text-2xl font-bold text-teal-600">🐕 Uauu Uauu! 🐕</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs - Mobile Optimized */}
        <Tabs defaultValue="gastos" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4 bg-white/90 backdrop-blur-sm h-12">
            <TabsTrigger
              value="gastos"
              className="flex flex-col items-center gap-1 text-xs data-[state=active]:bg-teal-100 data-[state=active]:text-teal-700 py-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>Gastos</span>
            </TabsTrigger>
            <TabsTrigger
              value="objetivos"
              className="flex flex-col items-center gap-1 text-xs data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-700 py-2"
            >
              <Target className="w-4 h-4" />
              <span>Objetivos</span>
            </TabsTrigger>
            <TabsTrigger
              value="lugares"
              className="flex flex-col items-center gap-1 text-xs data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 py-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Lugares</span>
            </TabsTrigger>
            <TabsTrigger
              value="calendario"
              className="flex flex-col items-center gap-1 text-xs data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 py-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Calendario</span>
            </TabsTrigger>
            <TabsTrigger
              value="hogar"
              className="flex flex-col items-center gap-1 text-xs data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 py-2"
            >
              <Home className="w-4 h-4" />
              <span>Hogar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gastos" className="mt-0">
            <GastosScreen />
          </TabsContent>

          <TabsContent value="objetivos" className="mt-0">
            <ObjetivosScreen />
          </TabsContent>

          <TabsContent value="lugares" className="mt-0">
            <LugaresScreen />
          </TabsContent>

          <TabsContent value="calendario" className="mt-0">
            <CalendarioScreen />
          </TabsContent>

          <TabsContent value="hogar" className="mt-0">
            <HogarScreen />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
