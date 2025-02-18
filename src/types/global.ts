/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    electron: any
    api: any
  }
}
export default global
