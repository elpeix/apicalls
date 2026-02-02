import React from 'react'
import { useRequestData, useRequestActions } from '../../context/RequestContext'
import styles from './Request.module.css'
import MethodSelect from '../base/MethodSelect/MethodSelect'

export default function RequestMethod() {
  const { method } = useRequestData()
  const { setMethod } = useRequestActions()

  return (
    <div className={styles.method}>
      <MethodSelect method={method} onSelect={setMethod} />
    </div>
  )
}
