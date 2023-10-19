import React, { useContext } from 'react'
import RequestUrl from './RequestUrl'
import Select from 'react-select'
import { RequestContext } from '../../context/RequestContext'

export default function RequestBar() {

  const context = useContext(RequestContext)
  const handleSelectChange = value => context.request.setMethod(value)

  return (
    <div className='request-basic'>
      <div className='request-method'>
        <Select
          className='select'
          classNamePrefix='select'
          onChange={handleSelectChange}
          defaultValue={context.request.method}
          isClearable={false}
          isSearchable={false}
          unstyled={true}
          options={context.request.methods} />
      </div>
      <RequestUrl />
      <button 
        className='request-send'
        onClick={context.request.fetch}
        disabled={context.fetching}>
          Send
      </button>
    </div>
  )
}
