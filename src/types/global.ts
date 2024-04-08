/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    electron: any
    api: {}
  }
}
export default global
