import { useState } from 'react'

export function useHistory() {

  const [history, setHistory] = useState([])
  const add = (request) => {
    const newHistory = [...history, request]
    setHistory(newHistory)
  }
  const remove = (id) => setHistory(history.filter(history => history.id !== id))
  const clear = () => setHistory([])
  const getAll = () => history
  const get = id => history.find(history => history.id === id)

  return {
    getAll,
    add,
    remove,
    clear,
    get
  }

}