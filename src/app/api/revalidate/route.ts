import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

function cleanPath(path: string | null) {
  if (!path) return null;
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (!expectedSecret) {
    return NextResponse.json({ ok: false, error: "Missing REVALIDATE_SECRET" }, { status: 500 });
  }

  if (secret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: "Invalid secret" }, { status: 401 });
  }

  const path = cleanPath(url.searchParams.get("path"));
  const tag = url.searchParams.get("tag")?.trim();

  if (!path && !tag) {
    return NextResponse.json({ ok: false, error: "Provide a path or tag" }, { status: 400 });
  }

  if (path) revalidatePath(path);
  if (tag) revalidateTag(tag);

  return NextResponse.json({
    ok: true,
    revalidated: {
      path,
      tag: tag || null
    },
    at: new Date().toISOString()
  });
}
