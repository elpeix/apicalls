import React from 'react'
import styles from './Loading.module.css'
import Icon from '../Icon/Icon'

export default function Loading() {
  return (
    <div className={styles.loading}>
      <Icon icon='spin' size={20} spin />
      <span className={styles.loadingText}>Loading...</span>
    </div>
  )
}
