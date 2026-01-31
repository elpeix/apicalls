import React, { useContext } from 'react'
import { useRequestActions, ResponseContext } from '../../context/RequestContext'
import styles from './Request.module.css'
import Icon from '../base/Icon/Icon'

export default function SendButton() {
  const { fetch, cancel } = useRequestActions()
  const { fetching } = useContext(ResponseContext)

  return (
    <>
      {fetching && (
        <button className={styles.cancel} onClick={cancel}>
          <div className={styles.buttonIcon}>
            <Icon icon="close" />
          </div>
          <div className={styles.buttonText}>Cancel</div>
        </button>
      )}
      {!fetching && (
        <button className={styles.send} onClick={fetch}>
          <div className={styles.buttonIcon}>
            <Icon icon="send" />
          </div>
          <div className={styles.buttonText}>Send</div>
        </button>
      )}
    </>
  )
}
