/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-restricted-types */
declare global {
  interface Window {
    electron: any
    api: any
  }
}
export default global
