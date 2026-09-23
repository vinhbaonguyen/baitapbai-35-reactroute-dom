import React from 'react'

export default function TagList({ items = [], className = '' }) {
    return (
        <div className={`ld-tags ${className}`}>
            {items.length > 0
                ? items.map((item, index) => (
                    <span className='ld-tag' key={index}>{item}</span>
                ))
                : <span className='ld-empty'>Chưa có</span>
            }
        </div>
    )
}
