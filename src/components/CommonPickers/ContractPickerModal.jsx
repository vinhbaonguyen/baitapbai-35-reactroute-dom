import React, { useRef } from 'react'
import Modal from 'react-modal'
import { CONTRACT_TYPES } from '../../constants/lecturer/lecturer.constants'
import { getModalStyle } from '../../constants/modalStyles'
import Draggable from 'react-draggable'


export default function ContractPickerModal({ current, onSelect, onClose, isAdmin }) {
    const nodeRef = useRef(null)
    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            style={getModalStyle('360px')}
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
            <h4 className="modal__title">Chọn Loại Hợp Đồng</h4>
            <div className='picker-list'>
                {CONTRACT_TYPES.map(c => {
                    const isActive = current === c.value;
                    return (
                        <div
                            className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                            key={c.value}
                            onClick={() => {
                                if (!isAdmin) return // ✅ chặn non-ADMIN
                                onSelect(c.value);
                            }}
                        >
                            <span className='picker-item__icon'>{c.icon}</span>

                            <div className='picker-item__content' >
                                <p className='picker-item__content--label'>{c.label}</p>
                                <p className='picker-item__content--desc' >{c.desc}</p>
                            </div>
                            {isActive && (
                                <span className='picker-item__check'>✓</span>
                            )}
                        </div>
                    )
                })}
                {!isAdmin && (
                    <p style={{ color: '#e74c3c', fontSize: '.8rem', textAlign: 'center' }}>
                        ⚠️ Chỉ ADMIN mới có thể thay đổi loại hợp đồng
                    </p>
                )}

            </div>
            <div className="modal__footer">
                <button className='btn btn--outline' onClick={onClose}>Đóng</button>
            </div>
        </Modal>
    )
}
