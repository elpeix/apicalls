import React, { useContext } from 'react'
import { RequestContext } from '../../context/RequestContext'
import styles from './Request.module.css'
import MethodSelect from '../base/MethodSelect/MethodSelect'

export default function RequestMethod() {
  const { request } = useContext(RequestContext)

  if (!request) return null

  return (
    <div className={styles.method}>
      <MethodSelect method={request.method} onSelect={request.setMethod} />
    </div>
  )
}
