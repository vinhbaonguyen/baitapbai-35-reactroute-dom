

import Modal from 'react-modal'
import React, { useMemo, useRef, useState } from 'react'
import { getModalStyle } from '@/constants/modalStyles'
import { alertError } from '@/utils/alert'
import '../../components/PageComponent/PageComponent.scss'
import Draggable from 'react-draggable'

export default function CoursePickerModal({ courseData = [], selected = null, onSave, onClose }) {
    const [picked, setPicked] = useState(selected)
    const [search, setSearch] = useState('')
    // Lọc theo search
    const filtered = useMemo(() => {
        const s = search.toLowerCase()
        return courseData.filter(c => c.courseName.toLowerCase().includes(s))
    }, [search, courseData,])

    const handlePick = (courseId) => {
        if (!picked) {
            setPicked(courseId)
            return
        }
        // Nếu chọn lại chính nó → toggle bỏ chọn
        if (picked === courseId) {
            setPicked(null)
            return
        }
        // Nếu chọn course khác → cảnh báo
        alertError({ title: 'Bạn chỉ có thể chọn duy nhất 1 khóa học' })
    }
    const nodeRef = useRef(null)
    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            style={getModalStyle('420px')}
            shouldFocusAfterRender={false}
            shouldReturnFocusAfterClose={false}
            ariaHideApp={false}
            contentElement={(props, children) => (
                <Draggable
                    handle='.modal__title'
                    nodeRef={nodeRef}
                    defaultPosition={{ x: -180, y: -270 }}
                    position={null}
                >
                    <div {...props} ref={nodeRef}>
                        {children}
                    </div>
                </Draggable>
            )}
        >
            <h4 className='modal__title'>Chọn Khóa Học</h4>
            {/* Search box */}
            <input
                className='picker-other__input'
                placeholder='Tìm kiếm khóa học...'
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            {/* Course list */}
            <div className='picker-grid'>
                {filtered.map(course => {
                    const isActive = picked === course.id
                    return (
                        <div
                            key={course.id}
                            className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                            onClick={() => handlePick(course.id)}
                        >
                            <div className='picker-item__content'>
                                <p className='picker-item__content--label'>{course.courseName}</p>
                                <p className='picker-item__content--desc'>{course.coursePeriod} giờ</p>
                                <p className={`badge badge--${course?.status.toLowerCase()}`}>{course.status}</p>
                            </div>
                            {isActive && (<span className='picker-item__check'>✓</span>)}
                        </div>
                    )
                })}
                {filtered.length === 0 && (
                    <p className='picker-item__content--desc'>Không tìm thấy khóa học phù hợp</p>
                )}
            </div>
            {/* Footer */}
            <div className="modal__footer">
                <button className='btn btn--outline' onClick={onClose}>Hủy</button>
                <button
                    className='btn btn--primary'
                    disabled={!picked}
                    onClick={() => onSave(picked)}
                >
                    Xác nhận
                </button>
            </div>
        </Modal>
    )
}
