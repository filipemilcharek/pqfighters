import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { createId } from "@paralleldrive/cuid2";

async function uploadToGCS(bytes: Uint8Array, filename: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Storage } = require("@google-cloud/storage");
  const storage = new Storage();
  const bucket = storage.bucket(process.env.GCS_BUCKET!);
  const blob = bucket.file(`uploads/${filename}`);
  await blob.save(Buffer.from(bytes), {
    contentType: `image/${filename.split(".").pop()}`,
    metadata: { cacheControl: "public, max-age=31536000" },
  });
  return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/uploads/${filename}`;
}

async function uploadToLocal(bytes: Uint8Array, filename: string): Promise<string> {
  const filePath = path.join(process.cwd(), "public", "uploads", filename);
  await writeFile(filePath, bytes);
  return `/uploads/${filename}`;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Arquivo muito grande (max 5MB)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${createId()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const url = process.env.GCS_BUCKET
    ? await uploadToGCS(bytes, filename)
    : await uploadToLocal(bytes, filename);

  return NextResponse.json({ url });
}
