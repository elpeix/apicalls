/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.css' {
  const content: any
  export default content
}

declare module '*.svg' {
  const content: any
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}
