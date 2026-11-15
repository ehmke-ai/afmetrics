import { useCallback, useSyncExternalStore } from "react"

/**
 * Shared client-side JSON loading for the static files under `public/`.
 *
 * Every URL is fetched at most once per page load: concurrent and later callers share the
 * same request. A failed request is dropped from the cache, so the next caller (or a retry)
 * fetches again. Aborting a caller's signal only rejects that caller; the shared request keeps
 * going for everyone else.
 */

export type JsonState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error }

type Entry = { promise: Promise<unknown>; state: JsonState<unknown> }

const LOADING: JsonState<never> = { status: "loading" }

const entries = new Map<string, Entry>()
const listeners = new Map<string, Set<() => void>>()

export class HttpError extends Error {
  constructor(
    readonly url: string,
    readonly status: number
  ) {
    super(`GET ${url} failed with ${status}`)
    this.name = "HttpError"
  }
}

function notify(url: string) {
  listeners.get(url)?.forEach((listener) => listener())
}

function abortError(signal: AbortSignal): Error {
  return signal.reason instanceof Error
    ? signal.reason
    : new DOMException("The operation was aborted.", "AbortError")
}

function start(url: string): Entry {
  const entry: Entry = { promise: Promise.resolve(), state: LOADING }
  entry.promise = fetch(url)
    .then((response) => {
      if (!response.ok) throw new HttpError(url, response.status)
      return response.json() as Promise<unknown>
    })
    .then(
      (data) => {
        entry.state = { status: "success", data }
        notify(url)
        return data
      },
      (cause: unknown) => {
        const error = cause instanceof Error ? cause : new Error(String(cause))
        entry.state = { status: "error", error }
        notify(url)
        throw error
      }
    )
  // Callers that only subscribe (useJson) never await the promise; keep the rejection handled.
  entry.promise.catch(() => {})
  entries.set(url, entry)
  return entry
}

/** The cached entry for `url`, starting a request when there is none or the last one failed */
function entryFor(url: string): Entry {
  const entry = entries.get(url)
  return entry && entry.state.status !== "error" ? entry : start(url)
}

/** Fetches and parses `url` once, sharing the result with every other caller */
export function loadJson<T>(url: string, options: { signal?: AbortSignal } = {}): Promise<T> {
  const { signal } = options
  if (signal?.aborted) return Promise.reject(abortError(signal))
  const promise = entryFor(url).promise as Promise<T>
  if (!signal) return promise
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError(signal))
    signal.addEventListener("abort", onAbort, { once: true })
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", onAbort))
  })
}

/** Drops every cached response. For tests. */
export function clearJsonCache() {
  entries.clear()
}

function subscribe(url: string, listener: () => void) {
  let set = listeners.get(url)
  if (!set) listeners.set(url, (set = new Set()))
  set.add(listener)
  entryFor(url)
  return () => {
    set.delete(listener)
  }
}

function snapshot<T>(url: string): JsonState<T> {
  return (entries.get(url)?.state ?? LOADING) as JsonState<T>
}

const noopSubscribe = () => () => {}
const loadingSnapshot = () => LOADING

export type JsonResult<T> = {
  data: T | null
  error: Error | null
  loading: boolean
  /** Fetches again after an error */
  retry: () => void
}

/**
 * React binding for `loadJson`. `null` skips loading. On the server (and during hydration)
 * it reports loading, so the client renders the same first frame.
 */
export function useJson<T>(url: string | null): JsonResult<T> {
  const sub = useCallback(
    (listener: () => void) => (url ? subscribe(url, listener) : () => {}),
    [url]
  )
  const get = useCallback(() => (url ? snapshot<T>(url) : LOADING), [url])
  const state = useSyncExternalStore(url ? sub : noopSubscribe, get, loadingSnapshot)
  const retry = useCallback(() => {
    if (!url) return
    const entry = entries.get(url)
    if (entry?.state.status === "error") {
      entries.delete(url)
      entryFor(url)
      notify(url)
    }
  }, [url])

  return {
    data: state.status === "success" ? state.data : null,
    error: state.status === "error" ? state.error : null,
    loading: url !== null && state.status === "loading",
    retry,
  }
}
