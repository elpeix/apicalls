import React, { useContext, useRef, useState } from 'react'
import styles from './Request.module.css'
import Icon from '../base/Icon/Icon'
import LinkedModal from '../base/linkedModal/LinkedModal'
import { RequestContext } from '../../context/RequestContext'
import SaveAs from './SaveAs/SaveAs'

export default function SaveButton() {
  const { path, save } = useContext(RequestContext)
  const arrowRef = useRef(null)
  const [showModal, setShowModal] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!path) return
    save()
  }

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowModal(!showModal)
  }

  const openDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDialog(true)
    setShowModal(false)
  }

  return (
    <div className={styles.saveButton}>
      <button className={styles.save} onClick={handleClick}>
        <div className={styles.buttonIcon}>
          <Icon icon="save" />
        </div>
        <div className={styles.buttonText}>Save</div>
      </button>
      <div ref={arrowRef} className={styles.buttonArrow} onClick={openModal}>
        <Icon icon="arrow" />
      </div>
      {showModal && (
        <LinkedModal
          parentRef={arrowRef}
          zIndex={1}
          topOffset={43}
          className={styles.saveAsModal}
          closeModal={() => setShowModal(false)}
        >
          <div onClick={openDialog}>Save as...</div>
        </LinkedModal>
      )}
      {showDialog && <SaveAs onClose={() => setShowDialog(false)} />}
    </div>
  )
}
