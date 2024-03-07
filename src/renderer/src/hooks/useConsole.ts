import { useState } from 'react'

export function useConsole(): ConsoleHook {
  const [logs, setLogs] = useState<RequestLog[]>([])

  const get = () => logs
  const add = (log: RequestLog) => setLogs([...logs, log])
  const clear = () => setLogs([])

  return { get, add, clear }
}
