export type OpenApiType = {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  paths: {
    [path: string]: {
      [method: string]: {
        summary?: string
        description?: string
        parameters?: Array<{
          name: string
          in: string
          required?: boolean
          schema?: unknown
          description?: string
        }>
        requestBody?: {
          content: {
            [media: string]: {
              schema: unknown
            }
          }
          required?: boolean
          description?: string
        }
        responses: {
          [status: string]: {
            description: string
            content?: {
              [media: string]: {
                schema: unknown
              }
            }
          }
        }
        tags?: string[]
        operationId?: string
        deprecated?: boolean
      }
    }
  }
}
