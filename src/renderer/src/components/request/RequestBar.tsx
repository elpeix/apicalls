import React, { useContext } from 'react'
import RequestUrl from './RequestUrl'
import Select from 'react-select'
import { RequestContext } from '../../context/RequestContext'
import styles from './Request.module.css'
import SaveButton from './SaveButton'
import SendButton from './SendButton'

export default function RequestBar() {
  const { request } = useContext(RequestContext)

  if (!request) return null

  const onChange = (value: any) => {
    const method: Method = {
      value: value.value,
      label: value.label,
      body: value.body
    }
    request.setMethod(method)
  }

  return (
    <div className={styles.content}>
      <div className={styles.method}>
        <Select
          className="select"
          classNamePrefix="select"
          classNames={{
            option: ({ data }) => data.value,
            singleValue: ({ selectProps }: { selectProps: { value: any } }) =>
              selectProps.value?.value || ''
          }}
          onChange={onChange}
          defaultValue={request.method}
          isClearable={false}
          isSearchable={false}
          unstyled={true}
          options={request.methods}
        />
      </div>
      <RequestUrl request={request} />
      <SendButton />
      <SaveButton />
    </div>
  )
}
