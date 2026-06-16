"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useAuth, AuthProvider } from "@/contexts/auth-context"
import { authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Store, AlertCircle } from "lucide-react"
import Link from "next/link"
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

function GoogleAuthButton() {
  const { googleLogin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      setLoading(true)
      try {
        await googleLogin(codeResponse.code)
        toast.success("¡Inicio de sesión exitoso con Google!")
        router.push("/dashboard")
      } catch (err: any) {
        toast.error(err.message || "Error al autenticar con Google")
      } finally {
        setLoading(false)
      }
    },
    onError: (errorResponse) => {
      toast.error("Error al iniciar sesión con Google")
      console.error(errorResponse)
    },
  })

  return (
    <Button 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2"
      onClick={() => handleGoogleLogin()}
      disabled={loading}
    >
      {loading ? "Conectando..." : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuar con Google
        </>
      )}
    </Button>
  )
}

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setError("")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setNeedsVerification(false)
    setIsLoading(true)

    try {
      await login(email, password)
    } catch (err: any) {
      const msg: string = err.message || ""
      // dj-rest-auth devuelve este mensaje cuando el email no está verificado
      if (
        msg.toLowerCase().includes("e-mail is not verified") ||
        msg.toLowerCase().includes("verific") ||
        msg.toLowerCase().includes("verified")
      ) {
        setNeedsVerification(true)
        setError("Tu correo aún no está verificado. Revisa tu bandeja de entrada o reenvía el correo.")
      } else {
        setError(msg || "Credenciales inválidas. Por favor intenta de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError("Ingresa tu correo para reenviar la verificación.")
      return
    }
    setResendLoading(true)
    try {
      await authApi.resendVerification(email)
      setResendSent(true)
      setError("")
    } catch (err: any) {
      setError(err.message || "No se pudo reenviar el correo.")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <Store className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl">Bienvenido</CardTitle>
        <CardDescription>Inicia sesión para gestionar tus tiendas</CardDescription>
      </CardHeader>
      <CardContent>
        {searchParams.get("registered") === "true" && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>
              ¡Registro exitoso! Por favor revisa tu correo y verifica tu cuenta antes de iniciar sesión.
            </AlertDescription>
          </Alert>
        )}
        {resendSent && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>
              ✅ Correo de verificación reenviado. Revisa tu bandeja de entrada.
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
          {needsVerification && !resendSent && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? "Reenviando..." : "Reenviar correo de verificación"}
            </Button>
          )}
        </form>

        <div className="mt-4 flex items-center justify-between">
          <span className="border-b w-1/5 lg:w-1/4"></span>
          <span className="text-xs text-center text-gray-500 uppercase">O iniciar sesión con</span>
          <span className="border-b w-1/5 lg:w-1/4"></span>
        </div>

        <div className="mt-4">
          <GoogleAuthButton />
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Regístrate
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}


export default function LoginPage() {
  const GOOGLE_CLIENT_ID = "1082793650997-9is93tksdvi8iffgieasco8918dpmm1o.apps.googleusercontent.com"

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
          <Suspense fallback={<div>Cargando...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
