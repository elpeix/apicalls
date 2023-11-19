import React, { useContext } from 'react'
import { RequestContext } from '../../context/RequestContext'
import styles from './Request.module.css'
import Icon from '../base/Icon/Icon'

export default function SendButton() {

  const { request, fetching } = useContext(RequestContext)

  return (
    <button className={styles.send} onClick={request.fetch} disabled={fetching}>
      <div className={styles.buttonIcon}><Icon icon="send" /></div>
      <div className={styles.buttonText}>Send</div>
    </button>
  )
}
