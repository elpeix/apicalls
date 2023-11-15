import React, { useContext } from 'react'
import RequestUrl from './RequestUrl'
import Select from 'react-select'
import { RequestContext } from '../../context/RequestContext'
import styles from './Request.module.css'

export default function RequestBar() {

  const { request, fetching } = useContext(RequestContext)
  const onChange = value => request.setMethod(value)

  return (
    <div className={styles.content}>
      <div className={styles.method}>
        <Select
          className='select'
          classNamePrefix='select'
          classNames={{
            option: ({ data }) => data.value,
            singleValue: ({ selectProps }) =>  selectProps.value?.value || '',
          }}
          onChange={onChange}
          defaultValue={request.method}
          isClearable={false}
          isSearchable={false}
          unstyled={true}
          options={request.methods} />
      </div>
      <RequestUrl request={request} />
      <button className={styles.send} onClick={request.fetch} disabled={fetching}>
        Send
      </button>
    </div>
  )
}
