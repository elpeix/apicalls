import React from 'react'
import ReactSelect, { PropsValue } from 'react-select'
import { getMethods } from '../../../lib/factory'

export default function MethodSelect({
  method,
  onSelect
}: {
  method: Method
  onSelect: (method: Method) => void
}) {
  const onChange = (value: PropsValue<Method>) => {
    if (!value) return
    if (value instanceof Array) return // This should never happen
    const method: Method = {
      value: value.value,
      label: value.label,
      body: value.body
    }
    onSelect(method)
  }

  return (
    <ReactSelect
      className="select"
      classNamePrefix="select"
      classNames={{
        option: ({ data }) => data.value,
        singleValue: ({ selectProps }: { selectProps: { value: PropsValue<Method> } }) => {
          if (!selectProps.value || selectProps.value instanceof Array) return ''
          return selectProps.value?.value || ''
        }
      }}
      onChange={onChange}
      defaultValue={method}
      isClearable={false}
      isSearchable={false}
      unstyled={true}
      options={getMethods()}
    />
  )
}
