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

export type PostmanQuery = {
  key: string | null
  value: string | null
  description?: string
  disabled?: boolean
}

export type PostmanUrl = {
  raw: string
  protocol?: string
  host?: string[]
  path?: string[]
  query?: PostmanQuery[]
  variable?: Array<{ key: string; value: string; description?: string }>
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type PostmanRequest = {
  method: string
  url: PostmanUrl
  header?: any[]
  body?: { raw: string }
}

export type PostmanItem = {
  id?: string
  name: string
  description?: string
  item?: PostmanItem[]
  request?: PostmanRequest | string
}

export type PostmanCollection = {
  info: {
    _postman_id?: string
    name: string
    description?: string
    schema?: string
  }
  item: PostmanItem[]
}
