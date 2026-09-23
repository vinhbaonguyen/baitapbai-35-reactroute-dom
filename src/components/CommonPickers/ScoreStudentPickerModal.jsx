/**
 * ScoreStudentPickerModal
 *
 * Tách riêng từ StudentListPickerModal vì use-case khác hẳn:
 * - StudentListPickerModal (ClassModal dùng): lọc theo courseId + hasPaidFee,
 *   cho phép chọn NHIỀU sinh viên để xếp vào lớp.
 * - ScoreStudentPickerModal (ScoreModal dùng): KHÔNG lọc theo course/học phí,
 *   lấy TOÀN BỘ sinh viên trong hệ thống, chỉ loại trừ những sinh viên
 *   đã có điểm (excludeStudentIds), và chỉ cho chọn DUY NHẤT 1 người.
 *
 * Props:
 *   selected           — id sinh viên đang được chọn (number | null), không phải mảng
 *   excludeStudentIds  — mảng studentId cần loại khỏi danh sách (đã có Score)
 *   onSelect           — callback(studentId: number) khi user xác nhận
 *   onClose            — đóng modal
 */

import { getModalStyle } from '@/constants/modalStyles';
import { selectStudents } from '@/store/selectors/masterDataSelectors'
import React, { useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import Modal from 'react-modal'
import Draggable from 'react-draggable';


export default function ScoreStudentPickerModal({
    selected = null,    
    studentsData = [],
    onSelect,
    onClose
}) {
    // Dữ liệu lấy ra từ Redux - store
    const allStudents = useSelector(selectStudents);
    
    // State của Modal 
    const [picked, setPicked] = useState(selected);
    const [search, setSearch] = useState('');
   
    // ── Loại sinh viên chưa xếp lớp/lớp chưa có lịch + đã có Score, rồi filter theo search ──
    const filteredStudents = useMemo(() => {      

        const keyword = search.toLowerCase().trim();
        
        if (!keyword) return studentsData;

        return studentsData.filter(s => s.studentName?.toLowerCase().includes(keyword))
    }, [studentsData, search]);

    // ── Chọn 1 sinh viên (singleSelect) — click lại để bỏ chọn ──
    const handlePick = (studentId) => {
        setPicked(prev => (prev === studentId ? null : studentId))}

    const handleConfirm = () => {
        console.log('[Picker] picked =', picked); // có giá trị đúng không?
        if (!picked) return;
        onSelect(picked);
        onClose();
    }

    const nodeRef = useRef(null)
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
                    defaultPosition={{ x: -200, y: -280 }}
                    position={null}
                >
                    <div {...props} ref={nodeRef}>
                        {children}
                    </div>
                </Draggable>
            )}
        >
            <div className="modal__header">
                <span>📋 Chọn Học Viên</span>
                <button
                    type="button"
                    onClick={onClose}
                    className='modal__header-btn'
                >✕</button>
            </div>

            {/* ── THANH TÌM KIẾM ── */}
            <div className='modal__search'>
                <input
                    placeholder='Tìm theo tên hoặc mã học viên...'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* ── DANH SÁCH SINH VIÊN ── */}
            <div className='modal__student' >
                {filteredStudents.length === 0 ? (
                    <p className='modal__student-list'>
                        {allStudents.length === 0
                            ? 'Chưa có học viên nào trong hệ thống'
                            : 'Không tìm thấy học viên phù hợp (có thể tất cả đã có điểm)'}
                    </p>
                ) : (
                    filteredStudents.map((student) => {
                        const isActive = picked === student.id
                        return (
                            <div
                                key={student.id}
                                onClick={() => handlePick(student.id)}
                                className='modal__student-list student-row'
                                title='click vào để chọn hay bỏ chọn '
                            >
                                {/* Avatar chữ cái đầu tên */}
                                <div className={`studentInitialCharacter ${isActive
                                    ? 'studentInitialCharacter--paid'
                                    : 'studentInitialCharacter--unpaid'}`}>
                                    {student.studentName?.charAt(student.studentName.lastIndexOf(' ') + 1) || '?'}
                                </div>

                                {/* Thông tin sinh viên */}
                                <div className='studentInfo'>
                                    <div className='studentInfo--name'>
                                        {student.studentName}
                                    </div>
                                    <div className='studentInfo--other'>
                                        {student.studentCode} · {student.email || 'Chưa có email'}
                                    </div>
                                </div>

                                {isActive && (
                                    <span className='studentInfo--checkmask' >✓</span>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* ── FOOTER ── */}
            <div className="modal__footer">
                <button type='button' className='btn btn--outline' onClick={onClose}>
                    Hủy
                </button>
                <button
                    type='button'
                    className='btn btn--primary'
                    disabled={!picked}
                    onClick={handleConfirm}
                >
                    Xác nhận
                </button>
            </div>
        </Modal>

    )
}
