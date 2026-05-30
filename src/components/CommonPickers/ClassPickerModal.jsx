import React, { useEffect, useRef, useState } from 'react'
import Modal from 'react-modal'
import { getAll } from '../../services/classService';
import { getModalStyle } from '../../constants/modalStyles';
import Draggable from 'react-draggable';

export default function ClassPickerModal({ selected = [], onSave, onClose }) {
    const [classes, setClasses] = useState([])
    const [picked, setPicked] = useState([...selected])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAll()
            .then(setClasses)
            .finally(() => setLoading(false))
    }, [])
    const toggle = (classCode) =>
        setPicked(prev => prev.includes(classCode)
            ? prev.filter(cls => cls !== classCode)
            : [...prev, classCode])
    const nodeRef = useRef(null)
    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            style={getModalStyle('400px')}
            shouldFocusAfterRender={false}
            shouldReturnFocusAfterClose={false}
            ariaHideApp={false}              // ✅ tắt aria-hide hoàn toàn
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
            <h4 className="modal__title">Các Lớp Đang Dạy</h4>
            {loading
                ? <p style={{ textAlign: 'center', color: '#666' }}>Đang tải...</p>
                : classes.length === 0
                    ? <p style={{ textAlign: 'center', color: '#666' }}>Chưa Có Lớp nào</p>
                    : (
                        <div className='picker-list'>
                            {classes.map(cls => {
                                const isActive = picked.includes(cls.classCode)
                                return (
                                    <label
                                        className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                                        key={cls.id}
                                    >
                                        <input
                                            className='picker-item__content'
                                            type='checkbox'
                                            checked={picked.includes(cls.classCode)}
                                            onChange={() => toggle(cls.classCode)}
                                        />
                                        <div>
                                            <p className='picker-item__label'>
                                                {cls.classCode}
                                            </p>
                                            <p className='picker-item__desc'>
                                                {cls.className} - {cls.description}
                                            </p>
                                        </div>
                                    </label>
                                )
                            })}
                        </div>
                    )
            }
            <div className="modal__footer">
                <button className="btn btn--outline" onClick={onClose}>Hủy</button>
                <button className="btn btn--primary" onClick={() => { onSave(picked); }}>
                    Xác Nhận ({picked.length})
                </button>
            </div>
        </Modal>
    )
}
