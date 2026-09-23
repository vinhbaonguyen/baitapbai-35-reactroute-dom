import React, { useRef, useState } from 'react';
import Modal from 'react-modal';
import { getModalStyle } from '../../constants/modalStyles';
import Draggable from 'react-draggable';
import { confirmPickerSelection } from '@/utils/confirmPickerSelection';

export default function SpecialtyPickerModal(
    {
        specialtyData = [],
        selected,
        onSave,
        onClose,
        modalTitle,
        onEmptyConfirm }
) {
    // selected giờ là specialtyId (number), không phải tên nữa
    const [picked, setPicked] = useState(selected != null ? Number(selected) : null)
    const nodeRef = useRef(null)
   
    const handlePick = (id) => {
        const sid = Number(id)
        setPicked(prev => (prev === sid ? null : sid))
    }   

    const handleConfirm = () => confirmPickerSelection({
        picked,
        onSave: (id) => {
            // Trả object {id, name} để SharedModal set cả 2 field cùng lúc
            const found = specialtyData.find(s => Number(s.id) === Number(id))
            onSave(found ? { id: found.id, name: found.name } : null)
        },       
        onClose,
        onEmptyConfirm,
        emptyTitle: 'Bạn chưa chọn Chuyên Môn'
    })
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
                    handle='.modal__header'
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
            <h4 className="modal__header">
                {modalTitle === 'course' ? 'Chọn Lĩnh Vực ' : 'Chọn Chuyên Môn'}
            </h4>
            <div className='picker-list'>
                {specialtyData.map(s => {
                    
                    const isActive = picked === s.id;
                    return (
                        <div
                            key={s.id}                           
                            onClick={() => handlePick(s.id)}
                            className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                        >
                            <span className='picker-item__text'>
                                {s.name}
                            </span>
                            {isActive && (<span className='picker-item__check'>✓</span>)}
                        </div>
                    );
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
