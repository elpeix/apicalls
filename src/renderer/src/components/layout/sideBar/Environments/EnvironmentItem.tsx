import React from 'react'
import ButtonIcon from '../../../base/ButtonIcon'
import styles from './Environment.module.css'
import Name from '../../../base/Name'

export default function EnvironmentItem({
  environment,
  selectEnvironment,
  activeEnvironment,
  deactiveEnvironment
}: {
  environment: Environment
  selectEnvironment: (environment: Environment) => void
  activeEnvironment: (id: Identifier) => void
  deactiveEnvironment: () => void
}) {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      activeEnvironment(environment.id)
    } else {
      deactiveEnvironment()
    }
  }

  return (
    <div
      className={`sidePanel-content-item ${styles.item}`}
      onClick={() => selectEnvironment(environment)}
    >
      <div className={styles.checkbox}>
        <input
          type="checkbox"
          checked={environment.active}
          onClick={(e) => e.stopPropagation()}
          onChange={onChange}
        />
      </div>
      <Name className={styles.title} name={environment.name} />
      <div className={styles.edit}>
        <ButtonIcon
          icon="edit"
          onClick={() => selectEnvironment(environment)}
          title="Edit environment"
        />
      </div>
    </div>
  )
}
