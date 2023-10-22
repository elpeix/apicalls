import { useState } from 'react'

export function useHistory() {

  const [history, setHistory] = useState([
    {
      date: '2020-09-01T00:00:00.000Z',
      id: '1',
      name: 'Test',
      request: {
        method: { value: 'GET', label: 'GET', body: false },
        url: 'https://jsonplaceholder.typicode.com/todos/2',
        headers: [
          { name: 'Content-Type', value: 'application/json', enabled: true },
          { name: 'Accept', value: 'application/json', enabled: true }
        ],
        params: [
          { name: 'userId', value: '1', enabled: true },
          { name: 'id', value: '1', enabled: true }
        ]
      }
    }
  ])
  const add = (request) => {
    const newHistory = [...history, request]
    setHistory(newHistory)
    console.log(newHistory)
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