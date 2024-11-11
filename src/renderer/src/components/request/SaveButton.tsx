import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from './Request.module.css'
import Icon from '../base/Icon/Icon'
import LinkedModal from '../base/linkedModal/LinkedModal'
import { RequestContext } from '../../context/RequestContext'
import SaveAs from './SaveAs/SaveAs'
import { AppContext } from '../../context/AppContext'

export default function SaveButton() {
  const { application } = useContext(AppContext)
  const { path, save, openSaveAs, setOpenSaveAs } = useContext(RequestContext)
  const arrowRef = useRef(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (openSaveAs) {
      openDialog()
      setShowModal(false)
    }
  }, [openSaveAs])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!path || path.length === 0) {
      openDialog()
    } else {
      save()
    }
  }

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowModal(!showModal)
  }

  const openDialog = () => {
    application.showDialog({
      children: <SaveAs onClose={closeDialog} />,
      onClose: closeDialog
    })
    setShowModal(false)
  }

  const closeDialog = () => {
    application.hideDialog()
    if (setOpenSaveAs) {
      setOpenSaveAs(false)
    }
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
          useOverlay={true}
          closeModal={() => setShowModal(false)}
        >
          <div onClick={openDialog}>Save as...</div>
        </LinkedModal>
      )}
    </div>
  )
}
