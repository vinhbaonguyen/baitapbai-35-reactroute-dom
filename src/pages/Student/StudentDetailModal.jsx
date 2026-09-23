import React, { useRef } from 'react'
import '../Lecturer/LectureDetailModal.scss'
import Modal from 'react-modal'
import { getModalStyle } from '../../constants/modalStyles'
import { formatDateDisplay } from '../../utils/date.utils.js'
import { getInitials } from '@/utils/string.utils'
import Draggable from 'react-draggable'

// ── Helper components ──────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
    <p className="ld-section">{children}</p>
)
const InfoRow = ({ label, value }) => (
    <div className="ld-row">
        <span className="ld-row__label">{label}</span>
        <span className="ld-row__value">{value}</span>
    </div>

)
const TagList = ({ items = [] }) => (
    <div className="ld-tags">
        {items?.length > 0
            ? items.map((item, index) => <span className='ld-tag' key={index}>{item}</span>)
            : <span className='ld-empty'>Chưa Có</span>
        }
    </div>

)
// ── Main component ─────────────────────────────────────────────────────────
export default function StudentDetailModal({ student, onClose, courseData, studentCourses }) {
    const nodeRef = useRef(null)
    if (!student) return null
    // console.log("Data courseData ", courseData);
    // student ở đây chính là 1 object của mappedData trong Student.jsx
    // console.log("Data student ", student);

    // const courseIds = student.courseIds ?? [];
    // const displayCourseNames = courseIds.length > 0
    //     ? courseIds.map(id => {
    //         const course = courseData.find(c => Number(c.id) === Number(id));
    //         return course ? course.courseName : `ID: ${id}`;
    //     }).join(', ')
    //     : 'Chưa Đăng Ký Khóa học';

    // console.log("hasPaidFee raw:", student.hasPaidFee, typeof student.hasPaidFee)
    return (
        <Modal
            isOpen={!!student}
            onRequestClose={onClose}
            style={getModalStyle('580px')}
            shouldFocusAfterRender={false}
            shouldReturnFocusAfterClose={false}
            ariaHideApp={false}              // ✅ tắt aria-hide hoàn toàn
            contentElement={(props, children) => (
                <Draggable
                    handle='.ld-header'
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
            {/* Header */}
            <div className="ld-header">
                <div className="ld-avatar">
                    {getInitials(student.studentName ?? '')}
                </div>
                <div>
                    <h3 className="ld-header__name">{student.studentName}</h3>
                    <span className="ld-header__code">{student.studentCode}</span>
                    {/* <span className={`badge badge--${student.status?.toLowerCase()}`}>
                        {student.status}
                    </span> */}
                </div>
                <button className='ld-close' onClick={onClose}>X</button>
            </div>
            {/* Thông tin cơ bản */}
            <SectionTitle>📋 Thông Tin Cơ Bản</SectionTitle>
            <div className="ld-grid">
                <InfoRow label="Giới Tính" value={student.gender} />
                <InfoRow label="Ngày Sinh" value={student.dob} />
                <InfoRow label="Email" value={student.email} />
                <InfoRow label="SĐT" value={student.phone} />
                <InfoRow label="Địa chỉ" value={student.address} />
                <InfoRow
                    label="Trạng Thái"
                    value={
                        <span className={`badge badge--${student.status?.toLowerCase()}`}>
                            {student.status}
                        </span>
                    }
                />
            </div>
            {/* Lớp đang theo học */}
            {/* <SectionTitle>🏫 Đang Theo Học Khóa</SectionTitle>
            <div className="ld-grid">
                <InfoRow label="Khóa Học" value={displayCourseNames} />
                <InfoRow
                    label="Học Phí"
                    value={
                        <span className={`badge ${student.hasPaidFee ? 'badge--active' : 'badge--suspended'}`}>
                            {student.hasPaidFee ? 'Đã Đóng' : 'Chưa Đóng'}
                        </span>
                    }
                />

            </div> */}
            {/* Khóa học & Học phí */}
            <SectionTitle>🏫 Khóa Học & Học Phí</SectionTitle>
            <div className="ld-grid">
                <InfoRow
                    label="Tổng quan việc Đóng Học Phí"
                    value={(() => {
                        const total = studentCourses?.length ?? 0;
                        const paid = studentCourses?.filter(sc => sc.hasPaidFee).length ?? 0;
                        const color = paid === total && total > 0 ? 'badge--active' : 'badge--suspended';
                        return (
                            <span className={`badge ${color}`}>
                                {total > 0 ? `${paid} / ${total} khóa học Đã Đóng Phí` : 'Chưa Đăng Ký Khóa Học'}
                            </span>
                        )
                    })()}
                />
            </div>
            {/* Bảng chi tiết từng course */}
            {studentCourses?.length > 0 && (
                <table className="ld-fee-table">
                    <thead>
                        <tr>
                            <th>Khóa Học</th>
                            <th>Học Phí</th>
                            <th>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentCourses.map(sc => {
                            // Tìm course tương ứng trong courseData theo courseId
                            const course = courseData.find(c => Number(c.id) === Number(sc.courseId));
                            return (
                                <tr key={sc.id}>
                                    <td>{course?.courseName ?? `ID: ${sc.courseId}`}</td>
                                    <td>
                                        {course?.tuitionFee
                                            ? `${course.tuitionFee.toLocaleString('vi-VN')} VND`
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        <span className={`badge ${sc.hasPaidFee ? 'badge--active' : 'badge--suspended'}`}>
                                            {sc.hasPaidFee ? '✅Đã Đóng' : '❌Chưa Đóng'}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}

                    </tbody>

                </table>

            )}

            {/* Thời gian */}
            <SectionTitle>🕐 Thời Gian</SectionTitle>
            <div className="ld-grid">
                <InfoRow label='Ngày Tạo' value={formatDateDisplay(student.createdAt)} />
                <InfoRow label='Cập Nhật' value={formatDateDisplay(student.updatedAt)} />
            </div>
            {/* Footer */}
            <div className="ld-footer">
                <button className="btn btn--outline" onClick={onClose}>Đóng</button>
            </div>
        </Modal>
    )
}
