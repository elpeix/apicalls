import React, { useContext, useState } from 'react'
import { AppContext } from '../../../../context/AppContext'
import ButtonIcon from '../../../base/ButtonIcon'
import CookiesGroup from './CookiesGroup'

export default function Cookies() {
  const { cookies } = useContext(AppContext)
  const [selectedGroup, setSelectedGroup] = useState<string>('')

  if (!cookies) {
    return null
  }

  const groups = cookies.getGroups()
  const groupedCookies = cookies.getGrouped()

  const handleUpdateGroup = (group: string, groupCookies: Cookie[]) => {
    cookies.updateGroup(group, groupCookies)
  }

  const handleRemoveGroup = (group: string) => {
    cookies.remove(group)
    setSelectedGroup('')
  }

  return (
    <>
      <div className="sidePanel-header">
        <div
          className={`sidePanel-header-title ${selectedGroup ? 'cursor-pointer' : ''}`}
          onClick={() => setSelectedGroup('')}
        >
          Cookies
        </div>
        {!selectedGroup && (
          <div>
            <ButtonIcon icon="clear" onClick={() => cookies.clear()} title="Clear all cookies" />
          </div>
        )}
      </div>
      {selectedGroup && (
        <CookiesGroup
          group={selectedGroup}
          cookies={groupedCookies.get(selectedGroup) || []}
          back={() => setSelectedGroup('')}
          update={handleUpdateGroup}
          remove={handleRemoveGroup}
        />
      )}
      {!selectedGroup && (
        <div className="sidePanel-content">
          {groups.map((group, index) => (
            <div
              key={`group_${index}`}
              className="sidePanel-content-item"
              onClick={() => setSelectedGroup(group)}
            >
              <div>{group}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
