export class RestCallerError extends Error {
  request: CallRequest
  response: CallResponse | null
  error: Error | null

  constructor(
    message: string,
    request: CallRequest,
    response: CallResponse | null,
    error: Error | null = null
  ) {
    super(message)
    this.request = request
    this.response = response
    this.error = error
  }

  getRequest = () => this.request
  getResponse = () => this.response
  getError = () => this.error
  getMessage = () => this.message
}
