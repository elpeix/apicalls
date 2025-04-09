import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from './Request.module.css'
import LinkedModal from '../base/linkedModal/LinkedModal'
import { RequestContext } from '../../context/RequestContext'
import { AppContext } from '../../context/AppContext'
import SaveAs from '../base/SaveAs/SaveAs'
import Menu from '../base/Menu/Menu'
import { MenuElement, MenuSeparator } from '../base/Menu/MenuElement'

export default function SaveButton() {
  const { application } = useContext(AppContext)
  const { tabId, path, save, openSaveAs, setOpenSaveAs, copyAsCurl } = useContext(RequestContext)
  const arrowRef = useRef(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (openSaveAs) {
      openDialog()
      setShowModal(false)
    }
  }, [openSaveAs])

  const handleClick = () => {
    if (!path || path.length === 0) {
      openDialog()
    } else {
      save()
    }
  }
  const openDialog = () => {
    application.showDialog({
      children: <SaveAs tabId={tabId} onClose={closeDialog} />,
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
      <Menu
        className={styles.saveAsModal}
        menuModalClassName={styles.saveAsMenuModal}
        icon="arrow"
        iconDirection="south"
        onClose={() => setShowModal(false)}
        topOffset={43}
        leftOffset={-1}
      >
        <MenuElement onClick={handleClick} title="Save" icon="save" />
        <MenuElement onClick={openDialog} title="Save as..." icon="save" />
        <MenuSeparator />
        <MenuElement onClick={copyAsCurl} title="Copy as cURL" icon="copy" />
      </Menu>
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
