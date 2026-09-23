import { getModalStyle } from '@/constants/modalStyles';
import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import Modal from 'react-modal';

export default function ClassStudentListModal({
    classCode, students = [], onClose
}) {
    const nodeRef = useRef(null);
    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            style={getModalStyle('480px')}
            shouldFocusAfterRender={false}
            shouldReturnFocusAfterClose={false}
            ariaHideApp={false}
            contentElement={(props, children) => (
                <Draggable
                    handle='.modal__header'
                    nodeRef={nodeRef}
                    defaultPosition={{ x: -240, y: -260 }}
                    position={null}
                >
                    <div {...props} ref={nodeRef}>{children}</div>
                </Draggable>
            )}
        >
            <div className="modal__header">
                <span className='modal__header-content'>
                    👥 Sinh viên lớp {classCode} ({students.length})
                </span>
                <button
                    type='button'
                    onClick={onClose}
                    className="modal__header-btn"
                >
                    ✕
                </button>
            </div>
            {/* 🔥 Scrolling behaviour: header/footer cố định, chỉ phần này cuộn */}
            <div className="modal__scroll-body">
                {students.length === 0 ? (
                    <p className="modal__student-list-inf">Lớp chưa có sinh viên nào</p>
                ) : (
                    students.map(s => (
                        <div key={s.id} className="modal__student-list student-row">
                            <div className="studentInitialCharacter">
                                {s.studentName?.charAt(s.studentName.lastIndexOf(' ') + 1) || '?'}
                            </div>
                            <div className="studentInfo">
                                <div className="studentInfo--name">{s.studentName}</div>
                                <div className="studentInfo--other">
                                    {s.studentCode} · {s.email || 'Chưa có email'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="modal__footer">
                <button type="button" className="btn btn--outline btn--cancel" onClick={onClose}>
                    Đóng
                </button>
            </div>

        </Modal>
    )
}
