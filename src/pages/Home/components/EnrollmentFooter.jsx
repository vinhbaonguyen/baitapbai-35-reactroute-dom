import React from 'react'

export default function EnrollmentFooter({
    visibleRows,
    allRows,
    onGoToClass,
    onGoToSchedule,
    onClose
}) {
  return (
    <div className='enroll-footer'>
        <span className='enroll-footer__count'>
           Hiển thị {visibleRows.length} / {allRows.length} lượt đăng ký
        </span>

        <div className="enroll-footer__actions">
            <button 
                className='enroll-footer__btn enroll-footer__btn--class'
                onClick={onGoToClass}                
            >
                Quản lý xếp lớp →
            </button>
            <button
                 className='enroll-footer__btn enroll-footer__btn--schedule'
                 onClick={onGoToSchedule}                 
            >
                Quản lý lịch học →

            </button>
            <button 
                className='enroll-footer__btn enroll-footer__btn--close'
                onClick={onClose}    
            >
                Đóng

            </button>
        </div>

    </div>
  )
}
