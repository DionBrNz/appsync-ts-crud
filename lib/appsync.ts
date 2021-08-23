export type AppSyncEvent<T> = {
  identity?: {
    sub?: string | null
    email?: string | null
  } | null
  arguments: {
    input: T
  }
}

export class AppSyncError extends Error {
  type: string
  info?: any
  constructor(message: string, type = 'UnknownError', info: any = null) {
    super(message)
    this.type = type
    this.info = info
  }
}

export type AppSyncResult<T> = {
  data: T | null
  errorInfo: any | null
  errorType: string | null
  errorMessage: string | null
}
