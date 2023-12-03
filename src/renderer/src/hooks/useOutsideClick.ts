import { useEffect } from 'react'

export function useOutsideClick(ref: any, callback: Function) {
  useEffect(() => {
    const handleClickOutside = (ev: any) => {
      if (ref && ref.current && !ref.current.contains(ev.target)) {
        if (typeof callback === 'function') {
          callback()
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, callback])
}
