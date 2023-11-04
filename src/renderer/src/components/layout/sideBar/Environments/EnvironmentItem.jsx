import React from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import styles from './Environment.module.css'

export default function EnvironmentItem({ 
  environment,
  selectEnvironment,
  activeEnvironment,
  deactiveEnvironment
}) {

  const onChange = e => {
    if (e.target.checked) {
      activeEnvironment(environment.id)
    } else {
      deactiveEnvironment()
    }
  }

  return (
    <div className={`sidePanel-content-item ${styles.item}`} onClick={() => selectEnvironment(environment)}>
      <input 
        type ='checkbox'
        checked={environment.active}
        onClick={e => e.stopPropagation()}
        onChange={onChange}
      />
      <div className={styles.title}>
        {environment.name}
      </div>
      <div className={styles.edit}>
        <ButtonIcon icon='edit' onClick={() => selectEnvironment(environment)} />
      </div>
    </div>
  )
}
