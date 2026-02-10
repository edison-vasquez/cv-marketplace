"use client"

import { signIn } from "next-auth/react"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Rocket, Github, Mail, ArrowRight } from "lucide-react"

function SignInForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    await signIn("credentials", {
      email,
      callbackUrl,
    })
  }

  const handleGitHubLogin = () => {
    signIn("github", { callbackUrl })
  }

  return (
    <>
      {/* GitHub Login */}
      <button
        onClick={handleGitHubLogin}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all mb-6"
      >
        <Github className="w-5 h-5" />
        Continuar con GitHub
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#0a0a0a] text-gray-500">o usa una cuenta demo</span>
        </div>
      </div>

      {/* Demo Login */}
      <form onSubmit={handleDemoLogin}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@visionhub.com"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Iniciar Sesión Demo
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        La cuenta demo te permite explorar todas las funcionalidades sin necesidad de registro.
      </p>
    </>
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Rocket className="w-10 h-10 text-blue-500" />
            <span className="text-3xl font-bold text-white">VisionHub</span>
          </div>
          <p className="text-gray-400">
            Inicia sesión para acceder al marketplace de Computer Vision
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-white/10">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          }>
            <SignInForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-8">
          Al continuar, aceptas los términos de servicio y política de privacidad.
        </p>
      </div>
    </div>
  )
}
