import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createShareLink,
  decryptPayload,
  encryptPayload,
  loadShare,
  parseShareHash,
  type SharePayload,
} from "../src/lib/share";

const payload: SharePayload = {
  v: 1,
  display: [
    {
      name: "swathr",
      count: 2,
      totalCount: 3,
      audio: true,
      times: [{ start: "1.000", end: "2.000", file: "Labels 0.txt" }],
    },
  ],
  files: ["Labels 0.txt"],
  bucketCounts: { "Labels 0.txt": { "0": 1, "1": 4 } },
  combine: true,
  createdAt: "2026-10-15T00:00:00.000Z",
};

const ID = "123e4567-e89b-42d3-a456-426614174000";

describe("encryptPayload / decryptPayload", () => {
  it("round-trips a payload", async () => {
    const { blob, key } = await encryptPayload(payload);
    expect(key).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(await decryptPayload(blob, key)).toEqual(payload);
  });

  it("does not contain the plaintext", async () => {
    const { blob } = await encryptPayload(payload);
    expect(new TextDecoder().decode(blob)).not.toContain("swathr");
  });

  it("fails with the wrong key", async () => {
    const { blob } = await encryptPayload(payload);
    const { key: otherKey } = await encryptPayload(payload);
    await expect(decryptPayload(blob, otherKey)).rejects.toThrow(
      /Couldn't decrypt/,
    );
  });

  it("fails when the ciphertext is tampered with", async () => {
    const { blob, key } = await encryptPayload(payload);
    blob[blob.length - 1] ^= 1;
    await expect(decryptPayload(blob, key)).rejects.toThrow(/Couldn't decrypt/);
  });

  it("authenticates the version byte as additional data", async () => {
    const { blob, key } = await encryptPayload(payload);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      Uint8Array.from(
        atob(key.replace(/-/g, "+").replace(/_/g, "/") + "="),
        (c) => c.charCodeAt(0),
      ),
      "AES-GCM",
      false,
      ["decrypt"],
    );
    const decrypt = (additionalData: Uint8Array) =>
      crypto.subtle.decrypt(
        { name: "AES-GCM", iv: blob.slice(1, 13), additionalData },
        cryptoKey,
        blob.slice(13),
      );
    await expect(decrypt(Uint8Array.of(1))).resolves.toBeDefined();
    await expect(decrypt(Uint8Array.of(2))).rejects.toThrow();
    await expect(decrypt(new Uint8Array(0))).rejects.toThrow();
  });

  it("rejects an unknown format version", async () => {
    const { blob, key } = await encryptPayload(payload);
    blob[0] = 2;
    await expect(decryptPayload(blob, key)).rejects.toThrow(/Unsupported/);
  });
});

describe("parseShareHash", () => {
  const key = "a".repeat(43);

  it("parses a share hash", () => {
    expect(parseShareHash(`#share=${ID}.${key}`)).toEqual({ id: ID, key });
  });

  it.each([
    "",
    "#",
    "#foo",
    `#share=${ID}`,
    `#share=${ID}.short`,
    `#share=nope.${key}`,
  ])("rejects %j", (hash) => {
    expect(parseShareHash(hash)).toBeNull();
  });
});

describe("createShareLink / loadShare", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads ciphertext and loads it back from the link", async () => {
    let stored: string | undefined;
    vi.stubGlobal("location", { origin: "https://example.test" });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (init?.method === "POST") {
          expect(init.body).toMatch(/^[A-Za-z0-9_-]+$/);
          stored = init.body as string;
          return Response.json({ id: ID }, { status: 201 });
        }
        expect(url).toBe(`/api/share/${ID}`);
        return new Response(stored);
      }),
    );

    const link = await createShareLink(payload);
    const url = new URL(link);
    expect(url.origin + url.pathname).toBe("https://example.test/nfc/merge");
    expect(stored).toBeDefined();

    const [, key] = url.hash.split(".");
    const fetchMock = vi.mocked(fetch);
    for (const [, init] of fetchMock.mock.calls) {
      expect(String(init?.body ?? "")).not.toContain(key);
    }
    expect(await loadShare(url.hash)).toEqual(payload);
  });

  it("reports a missing share", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 404 })),
    );
    await expect(loadShare(`#share=${ID}.${"a".repeat(43)}`)).rejects.toThrow(
      /not found/,
    );
  });
});
