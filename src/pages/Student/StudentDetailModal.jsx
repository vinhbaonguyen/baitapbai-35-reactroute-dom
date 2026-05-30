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
export default function StudentDetailModal({ student, onClose, courseData }) {
    const nodeRef = useRef(null)
    if (!student) return null
    const courseName = courseData?.find(c => c.id === student.courseId)?.courseName ?? 'underfined'

    return (
        <Modal
            isOpen={true}
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
                    {/* {student.studentName?.charAt(0).toUpperCase() ?? '?'} */}
                    {getInitials(student.studentName ?? '')}
                </div>
                <div>
                    <h3 className="ld-header__name">{student.studentName}</h3>
                    <span className="ld-header__code">{student.studentCode}</span>
                    <span className={`badge badge--${student.status?.toLowerCase()}`}>
                        {student.status}
                    </span>
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
                <InfoRow label="Trạng Thái" value={student.status} />

            </div>
            {/* Lớp đang theo học */}
            <SectionTitle>🏫 Đang Theo Học Khóa</SectionTitle>
            <div className="ld-row">
                {/* <span className="ld-row__label">Khóa Học</span> */}
                {/* <TagList items={student.courseId} /> */}
                {/* <InfoRow label="Khóa Học" value={student.courseId}/> */}
                <InfoRow label="Khóa Học" value={courseName} />

            </div>
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
