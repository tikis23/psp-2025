import type { AuditLogPage } from "@/types/audit"
import { fetchApi } from "./fetchClient"

export const getAuditLogs = (merchantId: number, actionType?: string, page: number = 0, size: number = 20): Promise<AuditLogPage> => {
  const params = new URLSearchParams({
    merchantId: merchantId.toString(),
    page: page.toString(),
    size: size.toString(),
  })
  if (actionType) {
    params.append("actionType", actionType)
  }
  return fetchApi<AuditLogPage>(`/api/audit/logs?${params.toString()}`, { method: "GET" })
}