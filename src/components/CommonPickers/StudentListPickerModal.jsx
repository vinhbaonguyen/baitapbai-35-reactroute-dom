import React, { useEffect, useRef, useState } from 'react'
import Modal from 'react-modal'
import * as studentCourseService from '../../services/studentCourseService.js'
import * as studentService from '../../services/studentService.js'
// import * as studentClassService from '../../services/studentClassService.js'
import { getModalStyle } from '@/constants/modalStyles.js';
import Draggable from 'react-draggable'
export default function StudentListPickerModal({
    courseId,
    classId,
    selected = [],  // source of truth từ form.studentList của ClassModal
    onSelect,
    onClose }) {

    const [students, setStudents] = useState([]);
    const [picked, setPicked] = useState(selected)
    // ✅ Load students mỗi khi courseId hoặc classId thay đổi
    useEffect(() => {
        if (!courseId) {
            console.log("⛔ Không có courseId → không load student");
            return;
        }
        const fetchData = async () => {
            // STEP 1: Load students đăng ký course này (để hiển thị danh sách)
            const studentCourseLists = await studentCourseService.getByCourse(courseId);
            const courseStudentIds = studentCourseLists?.map(scl => scl.studentId) || [];
            console.log("📌 STEP 1 — studentIds thuộc course:", courseStudentIds);

            // STEP 2: ✅ Dùng selected từ parent — không tự load student_class
            // Parent (ClassModal) đã load và quản lý qua enrichedEditItem:
            //   - Mở EDIT lần đầu: enrichedEditItem.studentList = [1,4] → form.studentList = [1,4]
            //   - Đổi courseId:     onFieldsChange reset → form.studentList = []
            //   - CREATE:           form.studentList = []

            const initialPicked = selected;  // luôn dùng từ parent
            setPicked(initialPicked);


            // STEP 3:✅ MERGE: gộp cả 2 danh sách, loại trùng bằng Set
            // Lý do: student đã assign có thể không còn trong student_course
            //        (đã đổi khóa học, hoặc data không đồng bộ)
            //        → vẫn phải hiển thị để user thấy và có thể bỏ chọn

            const allRelevantIds = [...new Set([...courseStudentIds, ...initialPicked])];
            console.log("📌 STEP 3 — allRelevantIds (merge):", allRelevantIds);

            // STEP 4: lấy thông tin đầy đủ của tất cả students liên quan
            const allStudents = await studentService.getAll();
            const list = allStudents.filter(s => allRelevantIds.includes(s.id));
            console.log("📌 STEP 4 — students hiển thị:", list);

            setStudents(list);

            console.log("📌 courseStudentIds:", courseStudentIds);
            console.log("📌 initialPicked (từ parent):", initialPicked);
            console.log("📌 students hiển thị:", list);
        }
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId, classId])

    // ✅ Toggle chọn/bỏ chọn — chỉ cập nhật local state
    // KHÔNG gọi onSelect ở đây → tránh vô hạn
    const handlePick = (id) => {
        setPicked(prev => prev.includes(id)
            ? prev.filter(x => x !== id)
            : [...prev, id]
        );
    };
    const nodeRef = useRef(null);
    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            style={getModalStyle('460px')}
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
            <h4 className="modal__title">Chọn Học Viên</h4>
            {/* Danh sách students */}
            <div className="picker-grid">
                {students?.map(s => {
                    const isActive = picked.includes(s.id)
                    return (
                        <span
                            key={s.id}
                            className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                            onClick={() => handlePick(s.id)}
                        >
                            <span className='picker-item__text'>{s.studentName}</span>
                            {isActive && <span className="picker-item__check">✓</span>}
                        </span>
                    )
                })}
            </div>
            {/* Selected tags */}
            {picked.length > 0 && (
                <div className='picker-other-display'>
                    <p className='picker-other-display__quantity'>
                        Đã Chọn ({picked.length})
                    </p>
                    <div className='picker-other-display__content'>
                        {picked.map(id => {
                            // ✅ tìm object từ students array để lấy tên
                            const student = students.find(s => s.id === id);
                            return (
                                <span key={id} className='picker-other-display__skill'>
                                    {student?.studentName || `ID: ${id}`}
                                    <span
                                        className='picker-other-display__delete'
                                        onClick={() => handlePick(id)}  // ✅ truyền id
                                    >X</span>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
            <div className="modal__footer">
                <div>
                    <button className='btn btn-secondary' onClick={onClose}>Hủy</button>
                </div>
                <button className='btn btn--primary' onClick={() => { onSelect(picked); onClose() }}>
                    Xác Nhận ({picked.length})
                </button>
            </div>
        </Modal>

    )
}
