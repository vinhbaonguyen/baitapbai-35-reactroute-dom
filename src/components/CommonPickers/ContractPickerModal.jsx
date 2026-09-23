import React, { useRef, useState } from 'react'
import Modal from 'react-modal'
// import { CONTRACT_TYPES } from '../../constants/lecturer/lecturer.constants'
import { getModalStyle } from '../../constants/modalStyles'
import Draggable from 'react-draggable'
import { confirmPickerSelection } from '@/utils/confirmPickerSelection'
import { CONTRACT_TYPES } from '@/constants/lecturer/lecture.master.fieldsConfig'


export default function ContractPickerModal({ selected, onSave, onClose, isAdmin, isEditMode, onEmptyConfirm }) {
    
    const [picked, setPicked] = useState(selected || null);
    const nodeRef = useRef(null)
    // ĐIỀU KIỆN CHUẨN: Được phép sửa nếu "KHÔNG CÓ current (Tạo mới)" HOẶC "LÀ ADMIN"
    const isReadOnly = isEditMode && !isAdmin;
    const handlePick = (contractType) => {
        setPicked(prev => (prev === contractType ? null : contractType))
    }
    const handleConfirm = () => confirmPickerSelection({
        picked,
        onSave,
        onClose,
        onEmptyConfirm,
        emptyTitle: 'Bạn chưa chọn Loại Hợp Đồng'
    })

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
            <h4 className="modal__header">Chọn Loại Hợp Đồng</h4>
            <div className='picker-list'>
                {CONTRACT_TYPES.map(c => {                    
                    const isActive = picked === c.value;
                    return (
                        <div
                            className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                            key={c.value}
                            onClick={() => {
                                if (isReadOnly) return // ✅ chặn non-ADMIN
                                handlePick(c.value);
                            }}
                            // Hiển thị chuột dạng cấm nếu là user thường đang xem chế độ Edit
                            style={isReadOnly ? { cursor: 'not-allowed', opacity: 0.6 } : { cursor: 'pointer' }}
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
                {isReadOnly && (
                    <p className='warning'>
                        ⚠️ Chỉ ADMIN mới có thể thay đổi loại hợp đồng
                    </p>
                )}

            </div>
            <div className="modal__footer">
                <button className='btn btn--outline' onClick={onClose}>
                    Đóng
                </button>
                <button
                    type='button'
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
