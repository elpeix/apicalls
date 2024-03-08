import { useState } from 'react'

export function useConsole(): ConsoleHook {
  const [logs, setLogs] = useState<RequestLog[]>([])

  const add = (log: RequestLog) => setLogs([...logs, log])
  const clear = () => setLogs([])

  return { logs, add, clear }
}
