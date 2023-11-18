import React, { useContext } from 'react'
import { RequestContext } from '../../context/RequestContext'
import styles from './Request.module.css'

export default function SendButton() {

  const { request, fetching } = useContext(RequestContext)

  return (
    <button className={styles.send} onClick={request.fetch} disabled={fetching}>
      Send
    </button>
  )
}
