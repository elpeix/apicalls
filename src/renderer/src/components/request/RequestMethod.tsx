import React, { useContext } from 'react'
import Select, { OnChangeValue, PropsValue } from 'react-select'
import { RequestContext } from '../../context/RequestContext'
import styles from './Request.module.css'

export default function RequestMethod() {
  const { request } = useContext(RequestContext)

  if (!request) return null

  type IsMulti = boolean

  const onChange = (value: OnChangeValue<Method, IsMulti>) => {
    if (!value) return
    if (value instanceof Array) return // This should never happen
    const method: Method = {
      value: value.value,
      label: value.label,
      body: value.body
    }
    request.setMethod(method)
  }

  return (
    <div className={styles.method}>
      <Select
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
        defaultValue={request.method}
        isClearable={false}
        isSearchable={false}
        unstyled={true}
        options={request.methods}
      />
    </div>
  )
}
