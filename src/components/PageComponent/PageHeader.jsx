import React, { memo } from 'react'
import './PageComponent.scss'
 function PageHeader({title,desc}) {
  return (
    <div className="page-header">
      <h2 className='page-header__title'>{title}</h2>
      <p className='page-header__desc'>{desc}</p>
    </div>
  )
}

export default memo(PageHeader)
