import React from 'react'
import styles from './ErrorFallback.module.css'

interface ErrorFallbackProps {
  error: Error | null
  resetErrorBoundary: () => void
}

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const handleCopy = () => {
    if (error) {
      navigator.clipboard.writeText(error.stack || error.message)
    }
  }

  return (
    <div className={styles.container}>
      <h1>Unexpected Error</h1>
      <p>Ooops! Something went wrong and the application crashed.</p>

      {error && <pre className={styles.errorBox}>{error.stack || error.message}</pre>}

      <div className={styles.buttonContainer}>
        <button onClick={handleCopy}>Copy Error</button>
        <button onClick={resetErrorBoundary} className="ok">
          Reload Application
        </button>
      </div>
    </div>
  )
}
