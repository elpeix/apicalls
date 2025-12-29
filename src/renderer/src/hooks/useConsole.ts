import { useState } from 'react'

export function useConsole(): ConsoleHookType {
  const [logs, setLogs] = useState<RequestLog[]>([])

  const add = (log: RequestLog) => setLogs((prevLogs) => [...prevLogs, log])
  const addAll = (requestLogs: RequestLog[]) => setLogs((prevLogs) => [...prevLogs, ...requestLogs])
  const clear = () => setLogs([])

  return { logs, add, addAll, clear }
}
