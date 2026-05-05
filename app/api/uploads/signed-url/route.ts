import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const { file_name, file_type, folder } = body;

  // 🔥 aquí llamas a tu backend real (Django, Node, etc)
  const backendRes = await fetch(`${process.env.API_URL}/uploads/signed-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_TOKEN}`, // opcional
    },
    body: JSON.stringify({
      file_name,
      file_type,
      folder,
    }),
  });

  const data = await backendRes.json();

  return NextResponse.json(data);
}