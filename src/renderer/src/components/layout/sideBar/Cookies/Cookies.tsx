import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../../../context/AppContext'
import ButtonIcon from '../../../base/ButtonIcon'
import CookiesGroup from './CookiesGroup'

export default function Cookies() {
  const { cookies } = useContext(AppContext)
  const [groups, setGroups] = useState<string[]>([])
  const [groupedCookies, setGroupedCookies] = useState<Map<string, Cookie[]>>(new Map())
  const [selectedGroup, setSelectedGroup] = useState<string>('')

  useEffect(() => {
    if (!cookies) return
    setGroups(cookies.getGroups())
    setGroupedCookies(cookies.getGrouped())
  }, [cookies])

  if (!cookies) return null

  const handleUpdateGroup = (group: string, groupCookies: Cookie[]) => {
    cookies.updateGroup(group, groupCookies)
  }

  const handleRemoveGroup = (group: string) => {
    cookies.remove(group)
    setSelectedGroup('')
    setGroups(cookies.getGroups())
    setGroupedCookies(cookies.getGrouped())
  }

  return (
    <>
      <div className="sidePanel-header">
        <div className="sidePanel-header-title">Cookies</div>
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
