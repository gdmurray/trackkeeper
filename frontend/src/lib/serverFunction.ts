export type ServerFunctionResponse<T = undefined> = {
  success: boolean
  error?: string
  status?: number
  data?: T
}
