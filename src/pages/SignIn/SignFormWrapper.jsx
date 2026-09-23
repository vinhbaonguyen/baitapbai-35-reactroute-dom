import React from 'react'

export default function SignFormWrapper({ className, onSubmit, children }) {
    return (
        <form className={`signin-form ${className}`} onSubmit={onSubmit}>
            {children}
            {/* Background động */}
            <div className='signin-form__bg'></div>
            {/* Góc trang trí */}
            <div className='signin-form__corner'></div>
        </form>
    )
}
