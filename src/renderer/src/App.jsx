import React from 'react'
import Layout from './components/layout/Layout'
import AppContextProvider from './context/AppContext'

export default function App() {
  return (
    <AppContextProvider>
      <Layout />
    </AppContextProvider>
  )
}
