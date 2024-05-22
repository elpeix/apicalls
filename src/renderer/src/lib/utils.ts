export function stringifySize(size: number): string {
  if (size < 1024) {
    return `${size} bytes`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  }
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}
