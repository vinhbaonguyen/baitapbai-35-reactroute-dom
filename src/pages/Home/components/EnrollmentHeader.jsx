import React from 'react'

export default function EnrollmentHeader({
    title,
    desc,
    onClose
}) {
    return (
        <div className="enroll-modal">
            <div className='enroll-modal__header'>
                <div className='enroll-modal__header-content'>
                    <h3 className='enroll-modal__header-title'>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className='enroll-modal__header-btn'
                    >
                        x
                    </button>
                </div>
                <p className='enroll-modal__header-title-main'>
                    {desc}
                </p>
            </div>
        </div>
    )
}
