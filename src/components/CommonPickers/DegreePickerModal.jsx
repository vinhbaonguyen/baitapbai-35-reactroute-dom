import React, { useRef, useState } from 'react'
import Modal from 'react-modal'
import { getModalStyle } from '../../constants/modalStyles'
import Draggable from 'react-draggable';
import { confirmPickerSelection } from '@/utils/confirmPickerSelection';

export default function DegreePickerModal({ selected, onSave, onClose, degreeOpts = [], onEmptyConfirm }) {
    const [picked, setPicked] = useState(selected || null)
    const nodeRef = useRef(null)
    const handlePick = (degree) => {

        setPicked(prev => (prev === degree ? null : degree))
    }

    const handleConfirm = () => confirmPickerSelection({
        picked,
        onSave,
        onClose,
        onEmptyConfirm,
        emptyTitle: 'Bạn chưa chọn Trạng Thái'

    })

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
            <h4 className='modal__header'>Chọn Bằng Cấp</h4>
            <div className='picker-list'>
                {degreeOpts?.map(d => {
                    const isActive = picked === d.value;
                    return (
                        <div
                            className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                            key={d.value}
                            // onClick={() => { onSelect(d.value); }}
                            onClick={() => handlePick(d.value)}
                        >
                            <span>{d.icon}</span>
                            <span>{d.label}</span>
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
