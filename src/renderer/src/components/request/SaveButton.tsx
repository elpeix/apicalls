import React, { useRef, useState } from 'react'
import styles from './Request.module.css'
import Icon from '../base/Icon/Icon'
import LinkedModal from '../base/linkedModal/LinkedModal'
import Dialog from '../base/dialog/Dialog'

export default function SaveButton() {

  const arrowRef = useRef(null)
  const [showModal, setShowModal] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

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
    <>
      <button className={styles.save}>
        <div className={styles.buttonIcon}><Icon icon="save" /></div>
        <div className={styles.buttonText}>Save</div>
      </button>
      <div ref={arrowRef} className={styles.buttonArrow} onClick={openModal}>
        <Icon icon="arrow" />
      </div>
      {showModal && (
        <LinkedModal
          parentRef={arrowRef}
          zIndex={1}
          topOffset={-1}
          className={styles.saveAsModal}
          closeModal={() => setShowModal(false)}
        >
          <div onClick={openDialog}>Save as...</div>
        </LinkedModal>
      )}
      { showDialog && (
        <Dialog onClose={() => setShowDialog(false)}>
          <div>Save as...</div>
        </Dialog>
      )}
    </>
  )
}