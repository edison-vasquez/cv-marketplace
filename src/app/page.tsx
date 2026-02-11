"use client"

import { useState, useEffect, useCallback } from "react"
import ModelCard from "@/components/marketplace/ModelCard"
import IndustryShowcase from "@/components/marketplace/IndustryShowcase"
import ServiceCTA from "@/components/shared/ServiceCTA"
import { Search, Loader2, ArrowRight, Eye, Cpu, Globe } from "lucide-react"

interface Model {
  id: string
  title: string
  slug: string
  creator: string
  category: string
  technical: string
  mAP: number
  image: string
  tags: string[]
  // Campos para inferencia local
  modelFormat?: string | null
  onnxModelUrl?: string | null
  modelSizeBytes?: number | null
  isPremium?: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function Home() {
  const [models, setModels] = useState<Model[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [technicalFilter, setTechnicalFilter] = useState("all")
  const [categories, setCategories] = useState<string[]>([])
  const [technicals, setTechnicals] = useState<string[]>([])

  // Fetch filters on mount
  useEffect(() => {
    fetch("/api/models/filters")
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || [])
        setTechnicals(data.technicals || [])
      })
      .catch(console.error)
  }, [])

  // Fetch models
  const fetchModels = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      })

      if (search) params.append("search", search)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (technicalFilter !== "all") params.append("technical", technicalFilter)

      const res = await fetch(`/api/models?${params}`)
      const data = await res.json()

      setModels(data.models || [])
      setPagination(data.pagination || null)
    } catch (error) {
      console.error("Error fetching models:", error)
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter, technicalFilter])

  // Fetch on filter change (debounced for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchModels(1)
    }, search ? 300 : 0)

    return () => clearTimeout(timer)
  }, [fetchModels])

  const scrollToModels = () => {
    const modelsSection = document.getElementById('modelos')
    if (modelsSection) {
      modelsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-[#f8f9fa] to-[#e8f0fe] -mx-6 px-6 rounded-2xl mb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#202124] mb-6 leading-tight">
              Visión Artificial para tu{" "}
              <span className="text-[#1a73e8]">Industria</span>
            </h1>

            <p className="text-lg text-[#5f6368] mb-8 leading-relaxed max-w-lg">
              Explora nuestro catálogo de modelos de Computer Vision, pruébalos en vivo desde tu navegador
              y conéctanos para integrarlos en tus sistemas de forma local o remota. Nosotros entrenamos e implementamos por ti.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={scrollToModels}
                className="px-6 py-3.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
              >
                <Eye className="w-5 h-5" />
                Explorar Modelos
              </button>
              <a
                href="mailto:edison@jhedai.com?subject=Solicitud%20Demo%20VisionHub"
                className="px-6 py-3.5 bg-white border-2 border-[#1a73e8] text-[#1a73e8] hover:bg-[#f8f9fa] rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
                Solicitar Demo
              </a>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#5f6368]">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#1a73e8]" />
                <span className="font-semibold">66+ Modelos</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#34a853]" />
                <span className="font-semibold">15+ Industrias</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#ea4335]" />
                <span className="font-semibold">Inferencia en Navegador</span>
              </div>
            </div>
          </div>

          {/* Right Column - Animated Bounding Box Simulation */}
          <div className="relative h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow-2xl">
            <style jsx>{`
              @keyframes bbox1 {
                0%, 100% { opacity: 0; transform: translate(20%, 30%) scale(0.8); }
                10%, 90% { opacity: 1; transform: translate(20%, 30%) scale(1); }
              }
              @keyframes bbox2 {
                0%, 100% { opacity: 0; transform: translate(60%, 50%) scale(0.8); }
                20%, 80% { opacity: 1; transform: translate(60%, 50%) scale(1); }
              }
              @keyframes bbox3 {
                0%, 100% { opacity: 0; transform: translate(10%, 65%) scale(0.8); }
                30%, 70% { opacity: 1; transform: translate(10%, 65%) scale(1); }
              }
              @keyframes bbox4 {
                0%, 100% { opacity: 0; transform: translate(70%, 20%) scale(0.8); }
                40%, 60% { opacity: 1; transform: translate(70%, 20%) scale(1); }
              }
            `}</style>

            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a73e8]/20 to-[#ea4335]/20" />
            </div>

            {/* Animated Bounding Boxes */}
            <div
              className="absolute w-32 h-32 border-4 border-[#34a853] rounded-lg"
              style={{
                animation: 'bbox1 6s ease-in-out infinite',
                boxShadow: '0 0 20px rgba(52, 168, 83, 0.6)'
              }}
            >
              <div className="absolute -top-6 left-0 bg-[#34a853] text-white text-xs font-bold px-2 py-1 rounded">
                Defect
              </div>
            </div>

            <div
              className="absolute w-24 h-24 border-4 border-[#ea4335] rounded-lg"
              style={{
                animation: 'bbox2 6s ease-in-out infinite',
                boxShadow: '0 0 20px rgba(234, 67, 53, 0.6)'
              }}
            >
              <div className="absolute -top-6 left-0 bg-[#ea4335] text-white text-xs font-bold px-2 py-1 rounded">
                Hazard
              </div>
            </div>

            <div
              className="absolute w-28 h-20 border-4 border-[#f9ab00] rounded-lg"
              style={{
                animation: 'bbox3 6s ease-in-out infinite',
                boxShadow: '0 0 20px rgba(249, 171, 0, 0.6)'
              }}
            >
              <div className="absolute -top-6 left-0 bg-[#f9ab00] text-white text-xs font-bold px-2 py-1 rounded">
                Object
              </div>
            </div>

            <div
              className="absolute w-20 h-28 border-4 border-[#1a73e8] rounded-lg"
              style={{
                animation: 'bbox4 6s ease-in-out infinite',
                boxShadow: '0 0 20px rgba(26, 115, 232, 0.6)'
              }}
            >
              <div className="absolute -top-6 left-0 bg-[#1a73e8] text-white text-xs font-bold px-2 py-1 rounded">
                Part
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Showcase */}
      <IndustryShowcase
        categories={categories}
        onSelectCategory={(category) => setCategoryFilter(category)}
      />

      {/* Model Grid Section */}
      <section id="modelos" className="py-8 border-t border-[#dadce0]">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative group mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9aa0a6] w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar modelos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#dfe1e5] rounded-full py-3.5 pl-14 pr-6 outline-none hover:shadow-md focus:shadow-md focus:border-transparent transition-all text-[#202124]"
          />
        </div>

        {/* Filtros por Tipo Técnico */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setTechnicalFilter("all")}
            className={technicalFilter === "all" ? "chip-active" : "chip"}
          >
            Todos los Modelos
          </button>
          {technicals.map(tech => (
            <button
              key={tech}
              onClick={() => setTechnicalFilter(tech)}
              className={technicalFilter === tech ? "chip-active" : "chip"}
            >
              {tech}
            </button>
          ))}
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="text-sm font-medium text-[#5f6368]">Industria:</span>
          <button
            onClick={() => setCategoryFilter("all")}
            className={categoryFilter === "all" ? "chip-active" : "chip"}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={categoryFilter === cat ? "chip-active" : "chip"}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-[#202124]">
            {search ? `Resultados para "${search}"` : "Modelos Populares"}
          </h2>
          <span className="text-sm text-[#5f6368]">
            {pagination ? `${pagination.total} modelos` : "Cargando..."}
          </span>
        </div>

        {/* Models Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#1a73e8] animate-spin" />
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#5f6368] text-lg">No se encontraron modelos</p>
            <p className="text-[#80868b] text-sm mt-2">
              Intenta ajustar tu búsqueda o filtros
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {models.map(model => (
                <ModelCard
                  key={model.id}
                  id={model.slug}
                  title={model.title}
                  creator={model.creator}
                  category={model.category}
                  mAP={model.mAP}
                  image={model.image}
                  tags={model.tags}
                  technical={model.technical}
                  modelFormat={model.modelFormat}
                  onnxModelUrl={model.onnxModelUrl}
                  modelSizeBytes={model.modelSizeBytes}
                  isPremium={model.isPremium}
                />
              ))}
            </div>

            {/* Paginación */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => fetchModels(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 text-sm font-medium text-[#1a73e8] border border-[#dadce0] rounded-lg hover:bg-[#f8f9fa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm text-[#5f6368]">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchModels(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-[#1a73e8] border border-[#dadce0] rounded-lg hover:bg-[#f8f9fa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Service CTA */}
      <ServiceCTA />
    </div>
  )
}
