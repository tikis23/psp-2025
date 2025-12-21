// {"content":[{"id":2,"actorUserId":152,"actorName":"kazys","actionType":"order.created","targetType":"Order","targetId":2,"dataBefore":null,"dataAfter":{"id":2,"items":[],"status":"OPEN","payments":[],"createdAt":"2025-12-21T18:16:21.314625+02:00","updatedAt":"2025-12-21T18:16:21.314675+02:00","merchantId":52},"createdAt":"2025-12-21T18:16:21.340739"},{"id":1,"actorUserId":152,"actorName":"kazys","actionType":"order.created","targetType":"Order","targetId":1,"dataBefore":null,"dataAfter":{"id":1,"items":[],"status":"OPEN","payments":[],"createdAt":"2025-12-21T17:25:44.427958+02:00","updatedAt":"2025-12-21T17:25:44.428014+02:00","merchantId":52},"createdAt":"2025-12-21T17:25:44.467042"}],"pageable":{"pageNumber":0,"pageSize":20,"sort":{"sorted":true,"empty":false,"unsorted":false},"offset":0,"paged":true,"unpaged":false},"totalPages":1,"totalElements":2,"last":true,"size":20,"number":0,"numberOfElements":2,"sort":{"sorted":true,"empty":false,"unsorted":false},"first":true,"empty":false}

export interface AuditLogEntry {
  id: number
  actorUserId: number
  actorName: string
  actionType: string
  targetType: string
  targetId: number
  dataBefore: any | null
  dataAfter: any | null
  createdAt: string
}

export interface AuditLogPage {
  content: AuditLogEntry[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      sorted: boolean
      empty: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number
  numberOfElements: number
  sort: {
    sorted: boolean
    empty: boolean
    unsorted: boolean
  }
  first: boolean
  empty: boolean
}