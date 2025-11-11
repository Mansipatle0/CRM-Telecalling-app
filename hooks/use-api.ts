import useSWR from "swr"
import { apiCall } from "@/lib/api-client"

export function useApi<T>(endpoint: string) {
  return useSWR<T>(endpoint, (url) => apiCall(url))
}
