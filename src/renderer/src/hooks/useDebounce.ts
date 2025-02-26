import { useEffect, useState } from 'react'

export function useDebounce<T>(
  value: string | number | boolean | T,
  delay: number,
  delayOnFalse = 0
) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    if ((typeof value === 'boolean' && !value) || (delayOnFalse > 0 && value === null)) {
      const handler = setTimeout(() => setDebouncedValue(value), delayOnFalse)
      return () => clearTimeout(handler)
    }
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay, delayOnFalse])

  return debouncedValue as T
}
