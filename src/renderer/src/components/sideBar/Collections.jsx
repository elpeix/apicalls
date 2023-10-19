import React, { useContext } from 'react'
import { AppContext } from '../../context/AppContext'

export default function Collections() {

  const appContext = useContext(AppContext)

  return (
    <>
      <div>
        {appContext.collections.items.map(collection => (
          <div key={collection.id}>{collection.name}</div>
        ))}
      </div>
    </>
  )
}
