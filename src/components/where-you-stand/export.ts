import { useEffect, useRef, useState } from "react"

import { downloadResults } from "@/lib/export-results"

/**
 * Copy-link and PNG/PDF export for the results block. Also scrolls to the results when the
 * page opens on a shared `#results` link.
 */
export function useResultsExport(fileName: string) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null)
  const [exportError, setExportError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  useEffect(() => {
    if (window.location.hash === "#results") {
      document.getElementById("results")?.scrollIntoView()
    }
  }, [])

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timeout)
  }, [copied])

  async function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}#results`
    try {
      await navigator.clipboard.writeText(url)
      setShareUrl(null)
      setCopied(true)
    } catch {
      // Clipboard access can be refused; show the link to copy by hand instead
      setCopied(false)
      setShareUrl(url)
    }
  }

  async function save(format: "png" | "pdf") {
    const root = rootRef.current
    if (!root) return
    setExporting(format)
    setExportError(false)
    try {
      await downloadResults(root, fileName, format)
    } catch {
      setExportError(true)
    } finally {
      setExporting(null)
    }
  }

  return { rootRef, exporting, exportError, save, copied, shareUrl, copyLink }
}
