import React from 'react'
import RequestUrl from './RequestUrl'
import styles from './Request.module.css'
import SaveButton from './SaveButton'
import SendButton from './SendButton'
import RequestMethod from './RequestMethod'

export default function RequestBar() {
  return (
    <div className={styles.requestBar}>
      <RequestMethod />
      <RequestUrl />
      <SendButton />
      <SaveButton />
    </div>
  )
}
