'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h2 className="text-2xl font-bold text-[#202124] mb-3">
          Algo salió mal
        </h2>

        <p className="text-[#5f6368] mb-8">
          Encontramos un error inesperado. Por favor intenta de nuevo o regresa a la página principal.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-left">
            <p className="text-xs font-mono text-red-700 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] rounded-xl font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
