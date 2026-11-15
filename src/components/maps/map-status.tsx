import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Overlay for a map's drawing area: a pulsing placeholder while its files load, or a short
 * message with a retry button when they failed. Renders nothing once the map is ready.
 * The parent must be `relative`.
 */
export function MapStatus({
  loading,
  error,
  onRetry,
  label = "map",
}: {
  loading: boolean
  error?: Error | null
  onRetry?: () => void
  /** What failed, for the message ("map", "county data") */
  label?: string
}) {
  if (error) {
    return (
      <div
        role="alert"
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-md bg-background/80 text-sm text-muted-foreground"
      >
        <p>Couldn&rsquo;t load the {label}.</p>
        {onRetry && (
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    )
  }
  if (!loading) return null
  return (
    <Skeleton
      role="status"
      aria-label={`Loading ${label}`}
      className="absolute inset-0 z-10 bg-muted/60"
    />
  )
}
