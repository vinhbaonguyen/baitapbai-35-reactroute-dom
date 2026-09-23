/**
 * StudentListPickerModal
 *
 * LOGIC MỚI (học phí):
* - feeMap[studentId-courseId] = true  → có thể chọn vào lớp (checkbox bật)
* - feeMap[studentId-courseId] = false → KHÔNG thể chọn (checkbox disabled, row mờ)
 *                                  + hiện nút ✉️ để USER gửi mail nhắc đóng tiền
 *
 * Props:
 *   courseId   — id khóa học đang xếp lớp (để filter đúng sinh viên)
 *   classId    — id lớp đang edit (null nếu tạo mới)
 *   selected   — mảng studentId đang được chọn
 *   onSelect   — callback(ids: number[]) khi user xác nhận
 *   onClose    — đóng modal
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Modal from 'react-modal'
import { getModalStyle } from '@/constants/modalStyles'
import { useSelector } from 'react-redux'
import { selectStudents, selectCourses, selectClasses, selectStudentClass } from '@/store/selectors/masterDataSelectors'
import Draggable from 'react-draggable'
import { alertError } from '@/utils/alert'

// ──────────────────────────────────────────────────────────────────────────────
// Helper: format tiền VNĐ
// ──────────────────────────────────────────────────────────────────────────────
const formatVND = (amount) => {
    if (!amount && amount !== 0) return 'Miễn phí'
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount)
}

// ──────────────────────────────────────────────────────────────────────────────
// Helper: tạo link Gmail compose (mở trình duyệt, không cần app mail)
// Dùng Gmail web thay vì mailto: để không phụ thuộc app mail mặc định
// ──────────────────────────────────────────────────────────────────────────────
const buildGmailLink = ({ to, subject, body }) => {
    const base = 'https://mail.google.com/mail/?view=cm&fs=1'
    return (
        base +
        `&to=${encodeURIComponent(to)}` +
        `&su=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`
    )
}

const buildSendMailLink = ({ student, courseName, tuitionFee }) => {
    const subject = `Nhắc đóng học phí khóa học: ${courseName}`
    const body =
        `Xin chào ${student.studentName},\n\n` +
        `Bạn đang đăng ký khóa học "${courseName}" với học phí ${formatVND(tuitionFee)}.\n\n` +
        `Hiện tại hệ thống ghi nhận bạn CHƯA hoàn tất đóng học phí.\n` +
        `Vui lòng đóng học phí sớm để được xếp vào lớp học.\n\n` +
        `Trân trọng,\nTrung Tâm Đào Tạo`
    return buildGmailLink({ to: student.email, subject, body })
}

// ──────────────────────────────────────────────────────────────────────────────
// Component chính
// ──────────────────────────────────────────────────────────────────────────────
export default function StudentListPickerModal({
    courseId,
    classId,   // ← thêm prop này (id lớp đang edit, null nếu create)
    selected = [],
    studentCourse,
    onSelect,
    onClose,

}) {
    // 1. Data từ Redux store
    const allStudents = useSelector(selectStudents)
    const allCourses = useSelector(selectCourses)
    // ✅ Thêm 2 selector này
    const allClasses = useSelector(selectClasses)
    const allStudentClass = useSelector(selectStudentClass)

    // 2. State nội bộ
    const [localSelected, setLocalSelected] = useState(selected)
    const [enrolledStudentIds, setEnrolledStudentIds] = useState([])
    // const [loadingEnrolled, setLoadingEnrolled] = useState(false)
    const [search, setSearch] = useState('')
    const [tab, setTab] = useState('all')

    const feeMap = useMemo(() => {
        const map = {};
        studentCourse.forEach(sc => {
            map[`${sc.studentId}-${sc.courseId}`] = sc.hasPaidFee;
        });
        return map;
    }, [studentCourse]);


    // 3. Lấy thông tin khóa học (tên + học phí)
    const course = useMemo(
        () => allCourses.find(c => Number(c.id) === Number(courseId)),
        [allCourses, courseId]
    )

    useEffect(() => {
        if (!courseId || !studentCourse) return;
        // Lấy tất cả studentId đăng ký đúng courseId này
        const ids = studentCourse
            .filter(sc => Number(sc.courseId) === Number(courseId))
            .map(sc => Number(sc.studentId));
        // eslint-disable-next-line
        setEnrolledStudentIds(ids);

    }, [studentCourse, courseId])

    // Nguồn chung: SV đã đăng ký đúng course này + chưa hoàn thành khóa học.
    // filteredStudents, stats, handleSendMailAll đều PHẢI dùng chung tập này,
    // tránh lặp lại điều kiện lọc rải rác nhiều nơi rồi lệch nhau (đã từng bug 2 lần)

    const eligibleStudents = useMemo(() => {
        return allStudents.filter(s => enrolledStudentIds.includes(Number(s.id)))
    }, [allStudents, enrolledStudentIds])

    // 5. Filter sinh viên theo courseId + search
    const filteredStudents = useMemo(() => {
        // Filter theo tab

        const byTab = eligibleStudents.filter(s => {
            const paid = feeMap[`${s.id}-${courseId}`] === true;
            if (tab === 'paid') return paid;
            if (tab === 'unpaid') return !paid
            return true // 'all'
        })
        // Filter theo search
        const keyword = search.toLowerCase()

        if (!keyword) return byTab

        return byTab.filter(s =>
            s.studentName?.toLowerCase().includes(keyword) ||
            s.studentCode?.toLowerCase().includes(keyword)
        )
    }, [eligibleStudents, tab, search, feeMap, courseId]);
    // Logic cánh báo khi có dirty Data
    const invalidSelectedStudents = useMemo(() => {
        // if (enrolledStudentIds.length === 0) return []
        // if (loadingEnrolled) return []

        return localSelected
            .filter(id => !enrolledStudentIds.includes(Number(id)))
            .map(id => allStudents.find(s => Number(s.id) === Number(id)))
            .filter(Boolean)
    }, [localSelected, enrolledStudentIds, allStudents])

    // 6. Thống kê nhanh
    const stats = useMemo(() => {
        // const inCourse = allStudents.filter(s => enrolledStudentIds.includes(s.id))
        return {
            // total: inCourse.length,           
            // paid: inCourse.filter(s => feeMap[`${s.id}-${courseId}`] === true).length,
            // unpaid: inCourse.filter(s => feeMap[`${s.id}-${courseId}`] !== true).length
            total: eligibleStudents.length,
            paid: eligibleStudents.filter(s => feeMap[`${s.id}-${courseId}`] === true && s.status !== 'Completed').length,
            unpaid: eligibleStudents.filter(s => feeMap[`${s.id}-${courseId}`] !== true).length,
        }
    }, [eligibleStudents, feeMap, courseId]);

    // 7. Toggle chọn/bỏ chọn 1 sinh viên
    const toggleStudent = useCallback((studentId) => {
        setLocalSelected(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        )
    }, [])

    // 8. Chọn tất cả SV đã đóng tiền
    const selectAllPaid = useCallback(() => {
        const paidIds = filteredStudents
            // .filter(s => s.hasPaidFee === true)
            .filter(s => feeMap[`${s.id}-${courseId}`] === true && s.status !== 'Completed')
            .map(s => s.id)
        // Gộp với localSelected hiện tại (không xóa cái cũ đã tick)
        setLocalSelected(prev => {
            const merged = new Set([...prev, ...paidIds])
            return [...merged]
        })
    }, [filteredStudents, feeMap, courseId])

    // 9. Bỏ chọn tất cả
    const clearAll = useCallback(() => {
        setLocalSelected([])
    }, [])

    // 10. Xác nhận
    const handleConfirm = useCallback(() => {

        if (invalidSelectedStudents.length > 0) {
            alertError({
                title: 'Còn sinh viên không hợp lệ trong danh sách',
                text: `Vui lòng bấm "Gỡ các SV không hợp lệ" trước khi xác nhận: ${invalidSelectedStudents.map(s => s.studentName).join(', ')}`
            })
            return
        }

        onSelect(localSelected)
        onClose()
    }, [invalidSelectedStudents, localSelected, onSelect, onClose])

    // 11. Gửi Gmail nhắc học phí cho 1 sinh viên
    const handleSendMail = useCallback((student) => {
        const link = buildSendMailLink({
            student,
            courseName: course?.courseName || '',
            tuitionFee: course?.tuitionFee
        })
        window.open(link, '_blank')
    }, [course])

    // 12. Gửi Gmail nhắc tất cả SV chưa đóng (dùng BCC)
    const handleSendMailAll = useCallback(() => {
        const unpaidStudents = eligibleStudents.filter(s =>
             feeMap[`${s.id}-${courseId}`] !== true && s.status !== 'Completed');

        if (unpaidStudents.length === 0) return;
        // Gmail web không hỗ trợ BCC qua URL — gửi TO tất cả email cùng lúc
        // Trình duyệt sẽ mở Gmail compose với nhiều recipient
        const toEmails = unpaidStudents.map(s => s.email).filter(Boolean).join(', ')
        const subject = `Nhắc đóng học phí khóa học: ${course?.courseName || ''}`
        const body =
            `Xin chào các bạn,\n\n` +
            `Đây là thông báo nhắc nhở đóng học phí cho khóa học "${course?.courseName || ''}"` +
            (course?.tuitionFee ? ` (${formatVND(course.tuitionFee)})` : '') + `.\n\n` +
            `Vui lòng hoàn tất học phí sớm để được xếp vào lớp học.\n\n` +
            `Trân trọng,\nTrung Tâm Đào Tạo`
        const link = buildGmailLink({ to: toEmails, subject, body })
        window.open(link, '_blank')
    }, [eligibleStudents, course, feeMap, courseId]);

    // 13. ✅ Tính studentId nào đã có lớp cho course này rồi
    // Ngoại trừ students đang ở chính lớp đang edit (classId)
    const alreadyInClassIds = useMemo(() => {
        // Lấy tất cả classId thuộc courseId này
        const classIdsOfThisCourse = allClasses
            .filter(cls => Number(cls.courseId) === Number(courseId))
            .map(cls => Number(cls.id))

        return allStudentClass
            .filter(sc => {
                const isInThisCourse = classIdsOfThisCourse.includes(Number(sc.classId))
                // Nếu đang EDIT lớp → cho phép student đang ở lớp này
                const isInCurrentClass = classId && Number(sc.classId) === Number(classId)
                return isInThisCourse && !isInCurrentClass
            }).map(sc => Number(sc.studentId))

    }, [allClasses, courseId, classId, allStudentClass])


    const handleRemoveInvalid = useCallback(() => {
        setLocalSelected(prev => prev.filter(id => enrolledStudentIds.includes(Number(id))))
    }, [enrolledStudentIds]);


    const nodeRef = useRef(null)
    console.log("enrolledStudentIds:", enrolledStudentIds)
    console.log("filteredStudents:", filteredStudents)
    console.log("allStudents ids:", allStudents.map(s => s.id))

    //  ───────── RENDER ────────────────────────────────   
    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            style={getModalStyle('560px')}
            shouldFocusAfterRender={false}
            shouldReturnFocusAfterClose={false}
            ariaHideApp={false}
            contentElement={(props, children) => (
                <Draggable
                    handle='.modal__header'
                    nodeRef={nodeRef}
                    defaultPosition={{ x: -210, y: -290 }}
                    position={null}

                >
                    <div {...props} ref={nodeRef}>
                        {children}
                    </div>
                </Draggable>

            )}
        >
            {/* ── HEADER ── */}
            <div className="modal__header" >
                <span className='modal__header-content'>
                    📋 Xếp Sinh Viên Vào Lớp
                </span>
                <button
                    type="button"
                    onClick={onClose}
                    className='modal__header-btn'
                >
                    ✕
                </button>
            </div>

            {/* ── THÔNG TIN KHÓA HỌC ── */}
            {course && (
                <div className='modal__course' >
                    <div>
                        <span className='modal__course-title'>Khóa học: </span>
                        <strong>{course.courseName}</strong>
                    </div>
                    <div>
                        <span className='modal__course-fee'>Học phí: </span>
                        <strong className={course.tuitionFee ? 'badge--fee' : 'badge--nofee'}>
                            {formatVND(course.tuitionFee)}
                        </strong>
                    </div>
                </div>
            )}

            {/* ── THỐNG KÊ (3 badge) ── */}
            <div className='modal__statistics'>
                <span className='badge--admin' >Tổng: {stats.total} SV</span>
                <span className='badge--active' >✅ Đã đóng: {stats.paid}</span>
                <span className='badge--pending' >⏳ Chưa đóng: {stats.unpaid}</span>
            </div>
            {/* Cảnh báo Dirty Data */}
            {invalidSelectedStudents.length > 0 && (
                <div className='modal__statistics-warning' >
                    Có {invalidSelectedStudents.length} sinh viên đang được xếp trong lớp nhưng không thuộc khóa học này:
                    <strong>
                        {' '}
                        {invalidSelectedStudents.map(s => s.studentName).join(', ')}
                    </strong>
                    <button
                        type="button"
                        className="btn btn--outline btn--danger"
                        onClick={handleRemoveInvalid}
                    >
                        🗑️ Gỡ các SV không hợp lệ

                    </button>
                </div>
            )}

            {/* ── TABS FILTER ── */}
            <div className='modal__filter' >
                {[
                    { key: 'all', label: `Tất cả (${stats.total})` },
                    { key: 'paid', label: `Đã đóng (${stats.paid})` },
                    { key: 'unpaid', label: `Chưa đóng (${stats.unpaid})` },
                ].map(t => (
                    <button
                        key={t.key}
                        type="button"
                        className={`modal__filter-btn  ${tab === t.key ? 'modal__filter-btn--active' : ''}`}
                        onClick={() => setTab(t.key)}
                        title={` lọc theo : ${t.label} `}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── THANH TÌM KIẾM + NÚT BATCH ── */}
            <div className='modal__search' >
                <input
                    type="text"
                    placeholder="Tìm theo tên hoặc mã SV..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button type="button" className="btn btn--outline btn--paid" onClick={selectAllPaid}>
                    ✅ Chọn đã đóng
                </button>
                <button type="button" className="btn btn--outline btn--unpaid" onClick={clearAll}>
                    Bỏ chọn tất cả
                </button>
            </div>

            {/* ── DANH SÁCH SINH VIÊN ── */}
            <div className='modal__student' >
                {filteredStudents.length === 0
                    ? (
                        <p className='modal__student-list' >
                            Đang tải...
                        </p>
                    ) : filteredStudents.length === 0 ? (
                        <p className='modal__student-list-inf'>
                            {enrolledStudentIds.length === 0
                                ? 'Chưa có sinh viên đăng ký khóa học này'
                                : 'Không tìm thấy sinh viên'}
                        </p>
                    ) : (
                        filteredStudents.map((student) => {
                            const isPaid = feeMap[`${student.id}-${courseId}`] === true
                            const isChecked = localSelected.includes(student.id)
                            // ✅ Thêm điều kiện này
                            const isAlreadyInAnotherClass = alreadyInClassIds.includes(Number(student.id))
                            const isCompleted = student.status === 'Completed'

                            // ✅ Disable nếu chưa đóng tiền HOẶC đã có lớp rồi
                            const isDisabled = !isPaid || isAlreadyInAnotherClass || isCompleted
                            return (
                                <div
                                    key={student.id}
                                    // style={{
                                    //     // SV chưa đóng tiền → mờ đi
                                    //     opacity: isPaid ? 1 : 0.85,
                                    //     transition: 'opacity 0.2s',
                                    // }}
                                    style={{ opacity: isDisabled ? 0.5 : 1 }}
                                    className='modal__student-list student-row'
                                >
                                    {/* Checkbox — chỉ bật khi đã đóng tiền */}
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        // disabled={!isPaid}    // ← KEY LOGIC: chưa đóng tiền = không cho chọn
                                        disabled={isDisabled}
                                        onChange={() => toggleStudent(student.id)}
                                        // title={isPaid ? 'Chọn sinh viên' : 'Sinh viên chưa đóng học phí'}
                                        // style={{ cursor: isPaid ? 'pointer' : 'not-allowed' }}
                                        title={
                                            isCompleted
                                                ? 'Sinh viên đã hoàn thành khóa học'
                                                : isAlreadyInAnotherClass
                                                    ? 'Sinh viên đã được xếp vào lớp khác cùng khóa học'
                                                    : isPaid
                                                        ? 'Chọn sinh viên'
                                                        : 'Sinh viên chưa đóng học phí'
                                        }
                                        style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                                    />

                                    {/* Avatar chữ cái đầu */}
                                    {/* <div className={`studentInitialCharacter ${isPaid
                                    ? 'studentInitialCharacter--paid'
                                    : 'studentInitialCharacter--unpaid'}`}
                                >
                                    {student.studentName?.charAt(student.studentName.lastIndexOf(' ') + 1) || '?'}
                                </div> */}
                                    {/* Avatar — đổi màu theo trạng thái */}
                                    <div className={`studentInitialCharacter 
                                    ${isCompleted
                                            ? 'studentInitialCharacter--completed'   // ← thêm class mới
                                            : isAlreadyInAnotherClass
                                                ? 'studentInitialCharacter--assigned'
                                                : isPaid
                                                    ? 'studentInitialCharacter--paid'
                                                    : 'studentInitialCharacter--unpaid'
                                        }`}>
                                        {student.studentName?.charAt(student.studentName.lastIndexOf(' ') + 1) || '?'}
                                    </div>

                                    {/* Thông tin sinh viên */}
                                    <div className='studentInfo' >
                                        <div className='studentInfo--name' >
                                            {student.studentName}
                                        </div>
                                        <div className='studentInfo--other' >
                                            {student.studentCode} · {student.email || 'Chưa có email'}
                                        </div>
                                    </div>

                                    {/* Badge trạng thái học phí */}
                                    {/* style={isPaid ? badgeStyle('success') : badgeStyle('warning')} */}
                                    {/* <span className={isPaid ? 'badge--active' : 'badge--pending'} >
                                    {isPaid ? '✅ Đã đóng' : '⏳ Chưa đóng'}
                                </span> */}
                                    <span className={
                                        isCompleted
                                            ? 'badge--completed'     // ← thêm class mới
                                            : isAlreadyInAnotherClass
                                                ? 'badge--assigned'
                                                : isPaid
                                                    ? 'badge--active'
                                                    : 'badge--pending'
                                    }>
                                        {isCompleted
                                            ? '🎓 Đã hoàn thành'
                                            : isAlreadyInAnotherClass
                                                ? '🔒 Đã có lớp'
                                                : isPaid
                                                    ? '✅ Đã đóng'
                                                    : '⏳ Chưa đóng'
                                        }
                                    </span>

                                    {/* Nút gửi mail — chỉ hiện khi CHƯA đóng tiền
                                {!isPaid && (
                                    <button
                                        type="button"
                                        title={`Gửi mail nhắc ${student.studentName} đóng học phí`}
                                        onClick={() => handleSendMail(student)}
                                    >
                                        ✉️ Nhắc
                                    </button>
                                )} */}
                                    {/* Nút gửi mail — chỉ hiện khi chưa đóng tiền VÀ chưa có lớp */}
                                    {!isPaid && !isAlreadyInAnotherClass && !isCompleted && (
                                        <button
                                            type="button"
                                            title={`Gửi mail nhắc ${student.studentName} đóng học phí`}
                                            onClick={() => handleSendMail(student)}
                                        >
                                            ✉️ Nhắc
                                        </button>
                                    )}
                                </div>
                            )
                        })
                    )}
            </div>

            {/* ── FOOTER ── */}
            <div className='modal__footer' >
                {/* Bên trái: nhắc tất cả SV chưa đóng */}
                <div className='modal__footer-left' >
                    {stats.unpaid > 0 && (
                        <button
                            type="button"
                            className="btn btn--outline btn--warning"
                            onClick={handleSendMailAll}
                            title="Gửi 1 mail BCC tới tất cả SV chưa đóng tiền"
                        >
                            ✉️ Nhắc tất cả ({stats.unpaid}) chưa đóng tiền
                        </button>
                    )}
                </div>

                {/* Bên phải: đã chọn + nút hành động */}
                <div className='modal__footer-right' >
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        Đã chọn: <strong>{localSelected.length}</strong> SV
                    </span>
                    <button type="button" className="btn btn--outline btn--cancel" onClick={onClose}>
                        Hủy
                    </button>
                    <button type="button" className="btn btn--primary" onClick={handleConfirm}>
                        Xác Nhận
                    </button>
                </div>
            </div>
        </Modal>
    )
}

