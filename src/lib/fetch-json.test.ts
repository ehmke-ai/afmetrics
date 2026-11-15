import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { clearJsonCache, HttpError, loadJson } from "@/lib/fetch-json"

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status })
}

describe("loadJson", () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    clearJsonCache()
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("shares one request between concurrent and later callers", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ a: 1 }))
    const [first, second] = await Promise.all([loadJson("/a.json"), loadJson("/a.json")])
    const third = await loadJson("/a.json")
    expect(first).toEqual({ a: 1 })
    expect(second).toBe(first)
    expect(third).toBe(first)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("keeps separate URLs separate", async () => {
    fetchMock.mockImplementation(async (url) => jsonResponse({ url: String(url) }))
    expect(await loadJson("/a.json")).toEqual({ url: "/a.json" })
    expect(await loadJson("/b.json")).toEqual({ url: "/b.json" })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("evicts a failed request so the next call fetches again", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500))
    await expect(loadJson("/a.json")).rejects.toBeInstanceOf(HttpError)

    fetchMock.mockRejectedValueOnce(new TypeError("network"))
    await expect(loadJson("/a.json")).rejects.toThrow("network")

    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }))
    expect(await loadJson("/a.json")).toEqual({ ok: true })
    expect(await loadJson("/a.json")).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it("rejects an aborted caller without cancelling the shared request", async () => {
    let resolve!: (r: Response) => void
    fetchMock.mockReturnValue(new Promise((r) => (resolve = r)))

    const controller = new AbortController()
    const aborted = loadJson("/a.json", { signal: controller.signal })
    const other = loadJson("/a.json")
    controller.abort()
    await expect(aborted).rejects.toMatchObject({ name: "AbortError" })

    resolve(jsonResponse({ a: 1 }))
    expect(await other).toEqual({ a: 1 })
    expect(await loadJson("/a.json")).toEqual({ a: 1 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("rejects at once with an already-aborted signal and does not fetch", async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(loadJson("/a.json", { signal: controller.signal })).rejects.toMatchObject({
      name: "AbortError",
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
