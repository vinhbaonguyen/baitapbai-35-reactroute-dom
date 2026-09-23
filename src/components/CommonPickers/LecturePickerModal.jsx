

import Modal from 'react-modal'
import React, { useMemo, useRef, useState } from 'react'
import { getModalStyle } from '@/constants/modalStyles'
import { alertError } from '@/utils/alert'
import '../../components/PageComponent/PageComponent.scss'
import Draggable from 'react-draggable'
import { confirmPickerSelection } from '@/utils/confirmPickerSelection'

export default function LecturePickerModal({ lectureData = [], selected = null, onSave, onClose,onEmptyConfirm }) {
    const [picked, setPicked] = useState(selected)
    const [search, setSearch] = useState('')
    // Lọc theo search
    const filtered = useMemo(() => {
        const s = search.toLowerCase()
        return lectureData.filter(l => l.lectureName.toLowerCase().includes(s))
    }, [search, lectureData,])

    const handlePick = (lectureId) => {
        if (!picked) {
            setPicked(lectureId)
            return
        }
        // Nếu chọn lại chính nó → toggle bỏ chọn
        if (picked === lectureId) {
            setPicked(null)
            return
        }
        // Nếu chọn course khác → cảnh báo
        alertError({ title: 'Bạn chỉ có thể chọn duy nhất 1 khóa học' })
    }
    const nodeRef = useRef(null)
    const handleConfirm = () => confirmPickerSelection({
        picked,
        onSave,
        onClose,
        onEmptyConfirm,
        emptyTitle:'Bạn chưa chọn Giáo Viên'

    })
    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            style={getModalStyle('690px')}
            shouldFocusAfterRender={false}
            shouldReturnFocusAfterClose={false}
            ariaHideApp={false}
            contentElement={(props, children) => (
                <Draggable
                    handle='.modal__header'
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
            <h4 className='modal__header'>Chọn Giáo Viên</h4>
            {/* Search box */}
            <input
                className='picker-other__input'
                placeholder='Tìm kiếm Giáo Viên...'
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            {/* Course list */}
            <div className='picker-grid'>
                {filtered.map(lecture => {
                    const isActive = picked === lecture.id
                    return (
                        <div
                            key={lecture.id}
                            className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                            onClick={() => handlePick(lecture.id)}
                        >
                            <div className='picker-item__content'>
                                <p className='picker-item__content--label'>{lecture.lectureName}</p>
                                <p className='picker-item__content--desc'>{lecture.specialty}</p>
                                <p className='picker-item__content--desc'>{lecture.degree}</p>

                                <p className={`badge badge--${lecture?.status.toLowerCase()}`}>{lecture.status}</p>
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
                    // disabled={!picked}
                    onClick={handleConfirm}
                >
                    Xác nhận
                </button>
            </div>
        </Modal>
    )
}
