import React, { useRef } from 'react'
import Modal from 'react-modal'
import { getModalStyle } from '../../constants/modalStyles'
import Draggable from 'react-draggable';

export default function DegreePickerModal({ current, onSelect, onClose, degreeOpts = [] }) {
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
            <h4 className='modal__title'>Chọn Trạng Thái</h4>
            <div className='picker-list'>
                {degreeOpts?.map(d => {
                    const isActive = current === d.value;
                    return (
                        <div
                            className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                            key={d.value}
                            onClick={() => { onSelect(d.value); }}
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
                <button className="btn btn--outline" onClick={onClose}> Đóng </button>
            </div>


        </Modal>

    )
}
