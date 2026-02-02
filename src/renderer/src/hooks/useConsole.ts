import { useState, useCallback, useMemo } from 'react'

export function useConsole(): ConsoleHookType {
  const [logs, setLogs] = useState<RequestLog[]>([])

  const add = useCallback((log: RequestLog) => setLogs((prevLogs) => [...prevLogs, log]), [])
  const addAll = useCallback(
    (requestLogs: RequestLog[]) => setLogs((prevLogs) => [...prevLogs, ...requestLogs]),
    []
  )
  const clear = useCallback(() => setLogs([]), [])

  return useMemo(() => ({ logs, add, addAll, clear }), [logs, add, addAll, clear])
}
