import React from 'react'
import Layout from './components/layout/Layout'
import AppContextProvider from './context/AppContext'
import Tooltip from './components/base/Tooltip/Tooltip'

export default function App() {
  return (
    <>
      <Tooltip />
      <AppContextProvider>
        <Layout />
      </AppContextProvider>
    </>
  )
}
