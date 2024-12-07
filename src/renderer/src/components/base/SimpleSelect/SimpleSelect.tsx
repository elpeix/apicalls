import React, { useEffect, useState } from 'react'
import styles from './SimpleSelect.module.css'

type OptionType = Partial<{
  value: string | number
  label: string
  [key: string]: string | number
}>

type GroupedOptionsType = {
  options: OptionType[]
  group: string
}

export default function SimpleSelect({
  value = undefined,
  className = '',
  options,
  autoFocus = false,
  groupBy = '',
  onChange = () => {}
}: {
  value: string | number | readonly string[] | undefined
  className?: string
  options: OptionType[]
  autoFocus?: boolean
  groupBy?: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
  const [groupedOptions, setGroupedOptions] = useState<GroupedOptionsType[]>([])

  const groupByOptions = (options: OptionType[], groupBy: string): GroupedOptionsType[] => {
    if (!options.length) return []
    if (!groupBy) return [{ options, group: '' }]
    return options.reduce((acc: GroupedOptionsType[], option: OptionType) => {
      let group = (option[groupBy] || '') as string
      group = group.charAt(0).toUpperCase() + group.slice(1)
      const existingGroup = acc.find((g) => g.group === group)
      if (existingGroup) {
        existingGroup.options.push(option)
      } else {
        acc.push({ group, options: [option] })
      }
      return acc
    }, [])
  }

  useEffect(() => {
    setGroupedOptions(groupByOptions(options, groupBy))
  }, [options, groupBy])

  return (
    <div className={`${className} ${styles.simpleSelect}`}>
      <select value={value} onChange={onChange} className={styles.select} autoFocus={autoFocus}>
        {groupedOptions.map((groupedOption: GroupedOptionsType) => (
          <GroupOptions
            key={groupedOption.group}
            options={groupedOption.options}
            group={groupedOption.group}
          />
        ))}
      </select>
    </div>
  )
}

function GroupOptions({ options, group }: { options: OptionType[]; group: string }) {
  if (!group) {
    return (
      <>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </>
    )
  }
  return (
    <optgroup label={group}>
      {options.map((option) => (
        <>
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        </>
      ))}
    </optgroup>
  )
}
