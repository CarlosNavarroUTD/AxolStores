"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const params = useParams()
  const router = useRouter()
  const key = params.key as string

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!key) {
      setStatus("error")
      setErrorMessage("No se proporcionó una clave de verificación.")
      return
    }

    const verify = async () => {
      try {
        await authApi.verifyEmail(key)
        setStatus("success")
      } catch (err: any) {
        setStatus("error")
        setErrorMessage(err.message || "Error al verificar el correo.")
      }
    }

    verify()
  }, [key])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
            {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-500" />}
            {status === "error" && <XCircle className="h-12 w-12 text-destructive" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verificando..."}
            {status === "success" && "¡Correo Verificado!"}
            {status === "error" && "Error de Verificación"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Estamos confirmando tu dirección de correo electrónico."}
            {status === "success" && "Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión."}
            {status === "error" && errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status !== "loading" && (
            <Button className="w-full mt-4" onClick={() => router.push("/login")}>
              Ir al Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
