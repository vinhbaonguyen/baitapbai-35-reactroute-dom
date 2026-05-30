import React from 'react'

export default function AuthHeader({ title, subtitle }) {
    return (
        <div className="signin-form__header">
            <p className="signin-form__title" style={{ fontSize: '1.1em' }}>{title}</p>
            <p className="signin-form__subtitle">{subtitle}</p>
        </div>

    )
}
