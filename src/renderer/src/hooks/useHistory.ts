import { useState } from 'react'

export function useHistory(): HistoryHook {
  const [history, setHistory] = useState<RequestType[]>([])
  const add = (request: RequestType) => {
    const newHistory = [...history, request]
    setHistory(newHistory)
  }
  const remove = (id: string) => setHistory(history.filter((history) => history.id !== id))
  const clear = () => setHistory([])
  const getAll = () => history
  const get = (id: Identifier) => history.find((history) => history.id === id)

  return {
    getAll,
    add,
    remove,
    clear,
    get
  }
}
