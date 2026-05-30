import React from 'react'

export default function FormItem({
    label,
    name,
    error,
    children,
    required = false,
    variant = 'default',  // lecture | shared | default
    layout = 'vertical', // vertical | horizontal

}) {
    return (
        <div className={`
                form-item 
                form-item--${variant} 
                form-item--${layout}
                ${error ? 'form-item--error' : ''}
        `}>
            {/* LABEL */}
            {label && (
                <label htmlFor={name} className='form-item__label'>
                    {label}
                    {required && <span className='form-item__required'>*</span>}
                </label>
            )}
            {/* CONTROL */}
            <div className='form-item__control'>
                {children}
            </div>
            {/* ERROR */}
            {error && (<div className='form-item__error'>
                {error && <small className='error-msg'>{error}</small>}
            </div>)}
        </div>
    )
}
