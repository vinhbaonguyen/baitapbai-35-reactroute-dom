import React from 'react'

export default function SectionTitle({ children, className = '' }) {
    return (
        <p className={`ld-section ${className}`}>{children}</p>
    )
}
