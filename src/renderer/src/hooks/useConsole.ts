import { useState } from 'react'

export function useConsole(): ConsoleHookType {
  const [logs, setLogs] = useState<RequestLog[]>([])

  const add = (log: RequestLog) => setLogs([...logs, log])
  const addAll = (requestLogs: RequestLog[]) => setLogs([...logs, ...requestLogs])
  const clear = () => setLogs([])

  return { logs, add, addAll, clear }
}
