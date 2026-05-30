import { getModalStyle } from '@/constants/modalStyles'
import { alertError } from '@/utils/alert'
import React, { useRef, useState } from 'react'
import Draggable from 'react-draggable'
import Modal from 'react-modal'
export default function BranchPickerModal({ current = null, branchOpts = [], onSelect, onClose }) {
    const [picked, setPicked] = useState(current)

    const handlePick = (branch) => {
        if (!picked) {
            setPicked(branch);
            onSelect(branch);
            return
        };
        if (picked === branch) {

            setPicked(null);
            onSelect(null)
            return
        }
        setPicked(branch)

        alertError({ title: 'Bạn chỉ có thể chọn duy nhất 1 khóa học' })
    }
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
            <h4 className='modal__title'>Chọn Chi Nhánh</h4>
            <div className='picker-list'>
                {branchOpts?.map(b => {
                    const isActive = current === b.value;
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
            </div>
        </Modal>
    )
}
