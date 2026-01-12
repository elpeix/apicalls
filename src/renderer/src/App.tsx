import React from 'react'
import Layout from './components/layout/Layout'
import AppContextProvider from './context/AppContext'
import Tooltip from './components/base/Tooltip/Tooltip'
import ErrorBoundary from './components/base/ErrorBoundary/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <Tooltip />
      <AppContextProvider>
        <Layout />
      </AppContextProvider>
    </ErrorBoundary>
  )
}
