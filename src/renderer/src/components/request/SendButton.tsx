import React, { useContext } from 'react'
import { RequestContext } from '../../context/RequestContext'
import styles from './Request.module.css'
import Icon from '../base/Icon/Icon'

export default function SendButton() {
  const { request, fetching } = useContext(RequestContext)

  if (!request) return null

  return (
    <>
      {fetching && (
        <button className={styles.cancel} onClick={request.cancel}>
          <div className={styles.buttonIcon}>
            <Icon icon="close" />
          </div>
          <div className={styles.buttonText}>Cancel</div>
        </button>
      )}
      {!fetching && (
        <button className={styles.send} onClick={request.fetch}>
          <div className={styles.buttonIcon}>
            <Icon icon="send" />
          </div>
          <div className={styles.buttonText}>Send</div>
        </button>
      )}
    </>
  )
}
