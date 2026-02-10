"use client"

import { useState, useEffect, useCallback } from "react"
import ModelCard from "@/components/marketplace/ModelCard"
import { Search, Loader2 } from "lucide-react"

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

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl md:text-6xl font-normal text-[#202124] mb-6">
          <span className="text-[#1a73e8]">Vision</span>Hub
        </h1>

        <p className="text-lg text-[#5f6368] max-w-xl mx-auto mb-10">
          Prueba modelos de Visión por Computadora directamente en tu navegador. Sin instalación, sin API keys, 100% local y gratuito.
        </p>

        {/* Barra de Búsqueda */}
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
        <div className="flex flex-wrap justify-center gap-2 mb-4">
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
      </section>

      {/* Sección de Categorías */}
      <section className="py-8 border-t border-[#dadce0]">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
    </div>
  )
}
