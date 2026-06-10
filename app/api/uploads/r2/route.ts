import { NextRequest, NextResponse } from "next/server"

/**
 * Proxy para subir archivos a R2.
 * Evita problemas de CORS al hacer el PUT desde el servidor en vez del navegador.
 *
 * El cliente envía:
 *   - Header "x-upload-url": la signed URL de R2
 *   - Header "content-type": el MIME del archivo
 *   - Body: el archivo en binario
 */
export async function PUT(req: NextRequest) {
  const uploadUrl = req.headers.get("x-upload-url")
  const contentType = req.headers.get("content-type") || "application/octet-stream"

  if (!uploadUrl) {
    return NextResponse.json(
      { error: "Missing x-upload-url header" },
      { status: 400 },
    )
  }

  try {
    const body = await req.arrayBuffer()

    const r2Response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: body,
    })

    if (!r2Response.ok) {
      const errorText = await r2Response.text()
      console.error("R2 upload failed:", r2Response.status, errorText)
      return NextResponse.json(
        { error: `R2 error: ${r2Response.status}`, details: errorText },
        { status: r2Response.status },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Proxy upload error:", error)
    return NextResponse.json(
      { error: error.message || "Upload proxy failed" },
      { status: 500 },
    )
  }
}
