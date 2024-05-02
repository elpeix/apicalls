import React from 'react'
import Prompt from '../../../base/PopupBoxes/Prompt'

export default function RequestCreator({
  onCancel,
  onCreate
}: {
  onCancel: () => void
  onCreate: (name: string) => void
}) {
  return (
    <Prompt
      message="Request name:"
      placeholder="Request name"
      confirmName="Add"
      onConfirm={onCreate}
      onCancel={onCancel}
    />
  )
}
