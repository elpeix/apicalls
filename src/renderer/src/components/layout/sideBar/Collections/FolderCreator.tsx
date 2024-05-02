import React from 'react'
import Prompt from '../../../base/PopupBoxes/Prompt'

export default function FolderCreator({
  onCancel,
  onCreate
}: {
  onCancel: () => void
  onCreate: (name: string) => void
}) {
  return (
    <Prompt
      message="Folder name:"
      placeholder="Folder name"
      confirmName="Add"
      onConfirm={onCreate}
      onCancel={onCancel}
    />
  )
}
