import React, { useRef, useState } from 'react'
import { getMethods } from '../../../lib/factory'
import LinkedModal from '../linkedModal/LinkedModal'
import styles from './MethodSelect.module.css'
import Icon from '../Icon/Icon'

export default function MethodSelect({
  method,
  onSelect
}: {
  method: Method
  onSelect: (method: Method) => void
}) {
  const selectRef = useRef(null)
  const [showSelect, setShowSelect] = useState(false)

  const onChange = (value: Method) => {
    const method: Method = {
      value: value.value,
      label: value.label,
      body: value.body
    }
    onSelect(method)
    setShowSelect(false)
  }

  return (
    <>
      <div ref={selectRef} onClick={() => setShowSelect(true)} className={styles.methodSelect}>
        <span className={method.value}>{method.label}</span>
        <Icon icon="arrow" direction="south" />
      </div>
      {showSelect && (
        <LinkedModal
          parentRef={selectRef}
          zIndex={1}
          topOffset={40}
          leftOffset={0}
          useOverlay={false}
          className={styles.selectModal}
          closeModal={() => setShowSelect(false)}
        >
          {getMethods().map((method) => (
            <div key={method.value} className={method.value} onClick={() => onChange(method)}>
              {method.label}
            </div>
          ))}
        </LinkedModal>
      )}
    </>
  )
}
