import {
  FIELD_URL,
  HISTORY_URL,
  SCHOOL_URL,
  type FieldFile,
  type SchoolFile,
} from "@/components/where-you-stand/shared"
import type { CountyHistory } from "@/lib/county-history"
import { useJson } from "@/lib/fetch-json"

/** The three data files the results read; the school file only when a school is chosen */
export function useWhereYouStandData(schoolId: string | undefined) {
  const fields = useJson<FieldFile>(FIELD_URL)
  const history = useJson<CountyHistory>(HISTORY_URL)
  const schoolFile = useJson<SchoolFile>(schoolId ? SCHOOL_URL : null)
  const failed = Boolean(fields.error || history.error)
  const loading = !failed && (!fields.data || !history.data)
  const schoolLoading = Boolean(schoolId) && !schoolFile.error && !schoolFile.data
  return {
    fields,
    history,
    schoolFile,
    failed,
    loading,
    /** Everything chosen has loaded, so the results can be exported */
    ready: !loading && !failed && !schoolLoading && !schoolFile.error,
  }
}
