export class RestCallerError extends Error {
  request: CallRequest
  response: CallResponse | null

  constructor(message: string, request: CallRequest, response: CallResponse | null) {
    super(message)
    this.request = request
    this.response = response
  }

  getRequest = () => this.request
  getResponse = () => this.response
}
