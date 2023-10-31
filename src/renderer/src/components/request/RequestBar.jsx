import React, { useContext } from 'react'
import RequestUrl from './RequestUrl'
import Select from 'react-select'
import { RequestContext } from '../../context/RequestContext'

export default function RequestBar() {

  const { request, fetching } = useContext(RequestContext)
  const onChange = value => request.setMethod(value)

  return (
    <div className='request-basic'>
      <div className='request-method'>
        <Select
          className='select'
          classNamePrefix='select'
          onChange={onChange}
          defaultValue={request.method}
          isClearable={false}
          isSearchable={false}
          unstyled={true}
          options={request.methods} />
      </div>
      <RequestUrl request={request} />
      <button className='request-send' onClick={request.fetch} disabled={fetching}>
        Send
      </button>
    </div>
  )
}
