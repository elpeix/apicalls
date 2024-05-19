import React from 'react'
import styles from './Response.module.css'
import Params from '../base/Params/Params'

export default function ResponseHeaders({ headers }: { headers: KeyValue[] }) {
  return (
    <>
      {headers.length > 0 && (
        <div className={styles.headers}>
          <Params
            items={headers}
            showEnable={false}
            showDelete={false}
            maxNameSize={700}
            defaultNameSize={300}
          />
        </div>
      )}
      {headers.length === 0 && <div>No headers</div>}
    </>
  )
}
