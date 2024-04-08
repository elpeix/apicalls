import { RefObject, useEffect } from 'react'

export function useOutsideClick(ref: RefObject<HTMLElement>, callback: () => void) {
  useEffect(() => {
    const handleClickOutside = (ev: globalThis.MouseEvent) => {
      if (ref && ref.current && !ref.current.contains(ev.target as Node)) {
        if (typeof callback === 'function') {
          callback()
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, callback])
}
