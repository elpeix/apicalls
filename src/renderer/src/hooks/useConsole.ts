import { useState } from 'react'

export function useConsole(): ConsoleHookType {
  const [logs, setLogs] = useState<RequestLog[]>([])

  const add = (log: RequestLog) => setLogs([...logs, log])
  const clear = () => setLogs([])

  return { logs, add, clear }
}
