import React, { useRef } from 'react'
import { SPECIALTY_LIST } from '../../constants/lecturer/lecturer.constants'
import Modal from 'react-modal';
import { getModalStyle } from '../../constants/modalStyles';
import Draggable from 'react-draggable';


export default function SpecialtyPickerModal({ current, onSelect, onClose, modalTitle }) {
    const nodeRef = useRef(null)
    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            style={getModalStyle('380px')}
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
                    <div {...props} ref={nodeRef} >
                        {children}
                    </div>
                </Draggable>
            )}
        >
            <h4 className="modal__title">{modalTitle === 'course' ? 'Chọn Lĩnh Vực ' : 'Chọn Chuyên Môn'}</h4>
            <div className='picker-list'>
                {SPECIALTY_LIST.map(s => {
                    const isActive = current === s;
                    return (
                        <div
                            key={s}
                            onClick={() => { onSelect(s); }}
                            className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                        >
                            <span className='picker-item__text'>
                                {s}
                            </span>
                            {isActive && (<span className='picker-item__check'>✓</span>)}
                        </div>
                    );
                })}
            </div>
            <div className="modal__footer">
                <button className="btn btn--outline" onClick={onClose}>Đóng</button>
            </div>
        </Modal>
    )
}
