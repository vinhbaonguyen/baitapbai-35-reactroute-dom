import React from 'react'

export default function InfoRow({ label, value, className }) {
    return (
        <div className={`ld-row ${className}`}>
            <span className="ld-row__label">{label}</span>
            <span className="ld-row__value">{value}</span>
        </div>
    )
}
