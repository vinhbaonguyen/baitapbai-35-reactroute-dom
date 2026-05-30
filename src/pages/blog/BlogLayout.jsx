import React from 'react'
import { Outlet } from 'react-router-dom'

export default function BlogLayout() {
  return (
    <div>
      <h2>Blog Layout Header </h2>
      <p>BlogLayout</p>
      <hr/>
      <Outlet/>
      
    </div>
  )
}
