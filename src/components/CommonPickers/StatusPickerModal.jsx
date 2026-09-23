import React, { useRef, useState } from 'react'
import Modal from 'react-modal'
import { getModalStyle } from '../../constants/modalStyles'
import Draggable from 'react-draggable';
import { confirmPickerSelection } from '@/utils/confirmPickerSelection';

export default function StatusPickerModal({ selected, onSave, onClose, statusOpts = [],onEmptyConfirm }) {
    const [picked,setPicked] = useState(selected || '');
    const handlePick = (status) => {
        setPicked(prev => (prev === status ? '' : status))
    }

    const handleConfirm = () => confirmPickerSelection({
        picked,
        onSave,
        onClose,
        onEmptyConfirm,
        emptyTitle:'Bạn chưa chọn Trạng thái'
    })
        

    const nodeRef = useRef(null)
    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            style={getModalStyle('320px')}
            shouldFocusAfterRender={false}
            shouldReturnFocusAfterClose={false}
            ariaHideApp={false}           // ✅ tắt aria-hide hoàn toàn
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
            <h4 className='modal__header'>Chọn Trạng Thái</h4>
            <div className='picker-list'>
                {statusOpts?.map(s => {
                    const isActive = picked === s.value;
                    return (
                        <div
                            className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                            key={s.value}
                            // onClick={() => { onSelect(s.value); }}
                            onClick = {()=>handlePick(s.value)}
                        >
                            <span>{s.icon}</span>
                            <span>{s.label}</span>
                            {isActive && (
                                <span className='picker-item__check'>✓</span>
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="modal__footer">
                <button className="btn btn--outline" onClick={onClose}>
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
