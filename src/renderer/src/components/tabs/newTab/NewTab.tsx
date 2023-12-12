import React, { useContext } from 'react'
import { AppContext } from '../../../context/AppContext'
import styles from './NewTab.module.css'
import ButtonIcon from '../../base/ButtonIcon'

export default function NewTab() {
  const { tabs } = useContext(AppContext)
  const onClick = () => tabs && tabs.newTab()

  return (
    <div className={styles.newTab}>
      <ButtonIcon icon="more" size={21} onClick={onClick} />
    </div>
  )
}
