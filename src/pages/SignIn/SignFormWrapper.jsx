import React from 'react'

export default function SignFormWrapper({ className, onSubmit, children }) {
    return (
        <form className={`signin-form ${className}`} onSubmit={onSubmit}>
            {children}
            <div className='signin-form__bg' />
            <div className='signin-form__corner' />
        </form>
    )
}
