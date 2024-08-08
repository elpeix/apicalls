import { useEffect, useState } from 'react'

export function useDebounce(value: string | number | boolean, delay: number, delayOnFalse = 0) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    if (typeof value === 'boolean' && !value) {
      const handler = setTimeout(() => setDebouncedValue(value), delayOnFalse)
      return () => clearTimeout(handler)
    }
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay, delayOnFalse])

  return debouncedValue
}
