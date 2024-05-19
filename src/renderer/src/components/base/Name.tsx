import React from 'react'

export default function Name({ name, className }: { name: string; className?: string }) {
  return <div className={className}>{name.length ? name : <em>Unnamed</em>}</div>
}
