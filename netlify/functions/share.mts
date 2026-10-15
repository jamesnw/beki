import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

// Stores opaque, client-encrypted share blobs. The decryption key never
// reaches this function; it lives only in the URL fragment.
//
// The ciphertext travels as base64url text rather than raw bytes: Netlify's
// local function emulator corrupts binary request bodies.

const MAX_BYTES = 1024 * 1024;
const BASE64URL_RE = /^[A-Za-z0-9_-]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const json = (body: unknown, status = 200) => Response.json(body, { status });

export default async (req: Request, context: Context) => {
  const store = getStore({ name: "merge-shares", consistency: "strong" });

  if (req.method === "POST") {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.startsWith("text/plain")) {
      return json({ error: "Expected text/plain" }, 415);
    }
    const declared = Number(req.headers.get("content-length") ?? 0);
    if (declared > MAX_BYTES) return json({ error: "Too large" }, 413);
    const body = await req.text();
    if (body.length > MAX_BYTES) return json({ error: "Too large" }, 413);
    if (!BASE64URL_RE.test(body)) {
      return json({ error: "Expected base64url data" }, 400);
    }

    const id = crypto.randomUUID();
    await store.set(id, body, {
      metadata: { createdAt: new Date().toISOString() },
    });
    return json({ id }, 201);
  }

  if (req.method === "GET") {
    const id = context.params.id;
    if (!id || !UUID_RE.test(id)) return json({ error: "Invalid id" }, 400);
    const data = await store.get(id, { type: "text" });
    if (!data) return json({ error: "Not found" }, 404);
    return new Response(data, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "private, max-age=31536000, immutable",
      },
    });
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config: Config = {
  path: ["/api/share", "/api/share/:id"],
};
