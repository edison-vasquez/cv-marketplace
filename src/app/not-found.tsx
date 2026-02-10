import Link from 'next/link'
import { Search, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[#e8f0fe] rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-[#1a73e8]" />
        </div>

        <h1 className="text-6xl font-bold text-[#1a73e8] mb-4">404</h1>

        <h2 className="text-2xl font-bold text-[#202124] mb-3">
          Página no encontrada
        </h2>

        <p className="text-[#5f6368] mb-8">
          La página que buscas no existe o ha sido movida.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl font-medium transition-colors"
        >
          <Home className="w-4 h-4" />
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
