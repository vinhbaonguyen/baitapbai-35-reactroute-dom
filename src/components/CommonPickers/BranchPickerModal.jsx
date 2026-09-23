import { getModalStyle } from '@/constants/modalStyles'

import { confirmPickerSelection } from '@/utils/confirmPickerSelection'
import React, { useRef, useState } from 'react'
import Draggable from 'react-draggable'
import Modal from 'react-modal'
export default function BranchPickerModal({ selected , branchOpts = [], onSave, onClose,onEmptyConfirm }) {
    const [picked, setPicked] = useState(selected || null)

    const handlePick = (branch) => {
       setPicked(prev => (prev === branch ? null : branch))
    }
    const handleConfirm = () => confirmPickerSelection({
        picked,
        onSave,
        onClose,
        onEmptyConfirm,
        emptyTitle: 'Bạn chưa chọn Chi Nhánh'
    })
    const nodeRef = useRef(null)
    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            style={getModalStyle('320px')}
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
            <h4 className='modal__header'>Chọn Chi Nhánh</h4>
            <div className='picker-list'>
                {branchOpts?.map(b => {
                    // const isActive = current === b.value;
                    const isActive = picked === b.value;
                    return (
                        <div
                            key={b.value}
                            className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                            // onClick={()=>onSelect(b.value)}
                            onClick={() => handlePick(b.value)}
                        >
                            <span>{b.label}</span>
                            {isActive && (<span className='picker-item__check'>✓</span>)}
                        </div>
                    )
                }

                )}

            </div>
            <div className="modal__footer">
                <button className='btn btn--outline' onClick={onClose} >
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
