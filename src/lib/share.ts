import type { DisplayResult } from "./aggregateResults";

export interface SharePayload {
  v: 1;
  display: DisplayResult[];
  files: string[];
  bucketCounts: Record<string, Record<string, number>>;
  combine: boolean;
  createdAt: string;
}

const FORMAT_VERSION = 1;
const IV_BYTES = 12;
const SHARE_ENDPOINT = "/api/share";

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const fromBase64Url = (str: string): Uint8Array => {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, "="));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
};

const pipeThrough = async (
  bytes: Uint8Array,
  transform: CompressionStream | DecompressionStream,
): Promise<Uint8Array> => {
  const stream = new Blob([bytes]).stream().pipeThrough(transform);
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

/** Gzip and encrypt a payload with a fresh AES-256-GCM key. */
export async function encryptPayload(
  payload: SharePayload,
): Promise<{ blob: Uint8Array; key: string }> {
  const plain = await pipeThrough(
    new TextEncoder().encode(JSON.stringify(payload)),
    new CompressionStream("gzip"),
  );
  const cryptoKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  // Authenticate the unencrypted version byte so it can't be altered.
  const additionalData = Uint8Array.of(FORMAT_VERSION);
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, additionalData },
      cryptoKey,
      plain,
    ),
  );
  const rawKey = new Uint8Array(
    await crypto.subtle.exportKey("raw", cryptoKey),
  );

  // Layout: [version][iv][ciphertext + auth tag]
  const blob = new Uint8Array(1 + IV_BYTES + cipher.length);
  blob[0] = FORMAT_VERSION;
  blob.set(iv, 1);
  blob.set(cipher, 1 + IV_BYTES);
  return { blob, key: toBase64Url(rawKey) };
}

export async function decryptPayload(
  blob: Uint8Array,
  key: string,
): Promise<SharePayload> {
  if (blob[0] !== FORMAT_VERSION || blob.length <= 1 + IV_BYTES) {
    throw new Error("Unsupported share format.");
  }
  const additionalData = blob.slice(0, 1);
  const iv = blob.slice(1, 1 + IV_BYTES);
  const cipher = blob.slice(1 + IV_BYTES);
  let plain: Uint8Array;
  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      fromBase64Url(key),
      { name: "AES-GCM" },
      false,
      ["decrypt"],
    );
    plain = new Uint8Array(
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv, additionalData },
        cryptoKey,
        cipher,
      ),
    );
  } catch {
    throw new Error(
      "Couldn't decrypt the shared results. The link may be incomplete.",
    );
  }
  const json = await pipeThrough(plain, new DecompressionStream("gzip"));
  const payload = JSON.parse(new TextDecoder().decode(json)) as SharePayload;
  if (payload?.v !== 1) throw new Error("Unsupported share format.");
  return payload;
}

/** Parse `#share=<id>.<key>`; returns null if the hash isn't a share link. */
export function parseShareHash(
  hash: string,
): { id: string; key: string } | null {
  const value = new URLSearchParams(hash.replace(/^#/, "")).get("share");
  const match = value?.match(/^([0-9a-f-]{36})\.([A-Za-z0-9_-]{43})$/);
  return match ? { id: match[1], key: match[2] } : null;
}

/** Encrypt and upload a payload, returning a link with the key in the hash. */
export async function createShareLink(payload: SharePayload): Promise<string> {
  const { blob, key } = await encryptPayload(payload);
  const res = await fetch(SHARE_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: toBase64Url(blob),
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status}).`);
  const { id } = (await res.json()) as { id: string };
  return `${location.origin}/nfc/merge#share=${id}.${key}`;
}

/** Fetch and decrypt the share referenced by a URL hash. */
export async function loadShare(hash: string): Promise<SharePayload> {
  const parsed = parseShareHash(hash);
  if (!parsed) throw new Error("This share link is malformed.");
  const res = await fetch(`${SHARE_ENDPOINT}/${parsed.id}`);
  if (res.status === 404)
    throw new Error("These shared results were not found.");
  if (!res.ok) throw new Error(`Couldn't load shared results (${res.status}).`);
  return decryptPayload(fromBase64Url(await res.text()), parsed.key);
}
