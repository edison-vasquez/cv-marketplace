import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-[#1a73e8] animate-spin mx-auto mb-4" />
        <p className="text-[#5f6368] text-sm">Cargando...</p>
      </div>
    </div>
  )
}
