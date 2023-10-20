import React, { useContext } from 'react'
import { AppContext } from '../../../context/AppContext'
import styles from './NewTab.module.css'
import ButtonIcon from '../../base/ButtonIcon'

export default function NewTab() {

  const appContext = useContext(AppContext)

  return (
    <>
      <div className={styles.newTab}>
        <ButtonIcon icon='more' size={21} onClick={appContext.tabs.newTab} />       
      </div>
    </>
  )
}
