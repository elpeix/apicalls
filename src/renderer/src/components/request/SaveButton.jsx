import React from 'react'
import styles from './Request.module.css'
import Icon from '../base/Icon/Icon'

export default function SaveButton() {
  return (
    <button className={styles.save}>
      <Icon icon="save" />
    </button>
  )
}
