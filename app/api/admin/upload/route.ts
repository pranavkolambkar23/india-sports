import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

const MAX_IMAGE_BYTES = 500 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, and WebP images are supported." },
      { status: 400 }
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Image must be 500 KB or smaller after compression." },
      { status: 400 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (supabaseUrl && serviceKey) {
    const supabase = createClient(supabaseUrl, serviceKey);
    const bucket = process.env.SUPABASE_MEDIA_BUCKET || "player-media";
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return NextResponse.json({
        url: data.publicUrl,
        storage: "supabase",
        sizeBytes: file.size,
      });
    }
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), bytes);

  return NextResponse.json({
    url: `/uploads/${fileName}`,
    storage: "local",
    sizeBytes: file.size,
  });
}
