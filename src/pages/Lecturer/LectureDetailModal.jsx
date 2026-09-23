import React, { useRef } from 'react'
import './LectureDetailModal.scss'
import Modal from 'react-modal'
import { getModalStyle } from '../../constants/modalStyles'
import { formatDateDisplay } from '../../utils/date.utils.js'
import Draggable from 'react-draggable'
import SectionTitle from '@/components/common/detailmodal/SectionTitle'
import InfoRow from '@/components/common/detailmodal/InfoRow'
import TagList from '@/components/common/detailmodal/TagList'
import { formatVND } from '@/utils/formatVND'

export default function LectureDetailModal({ lecture, onClose }) {
    const nodeRef = useRef(null)
    if (!lecture) {
        console.warn("⚠️ LectureDetailModal: 'lecture' không tồn tại.");
        return null;        
    }
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
                    defaultPosition={{ x: -180, y: -320 }}
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
                    {lecture.lectureName?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div>
                    <h3 className="ld-header__name">{lecture.lectureName}</h3>
                    <span className="ld-header__code">{lecture.lectureCode}</span>
                    <span className={`badge badge--${lecture.status?.toLowerCase()}`}>
                        {lecture.status}
                    </span>
                </div>
                <button className='ld-close' onClick={onClose}>X</button>
            </div>
            {/* Thông tin cơ bản */}
            <SectionTitle>📋 Thông Tin Cơ Bản</SectionTitle>
            <div className="ld-grid">
                <InfoRow label="Giới Tính" value={lecture.gender} />
                <InfoRow label="Ngày Sinh" value={lecture.dob} />
                <InfoRow label="Email" value={lecture.email} />
                <InfoRow label="SĐT" value={lecture.phone} />
                <InfoRow label="Địa chỉ" value={lecture.address} />
            </div>
            {/* Chuyên môn */}
            <SectionTitle>🎓 Chuyên Môn</SectionTitle>
            <div className="ld-grid">
                <InfoRow label="Chuyên môn" value={lecture.specialty} />
                <InfoRow label="Bằng Cấp" value={lecture.degree} />
                <InfoRow label="Kinh Nghiệm" value={lecture.experienceYears ? `${lecture.experienceYears} năm` : '-'} />
            </div>

            <div className="ld-row">
                <span className='ld-row__label'>Kỹ năng</span>
                <TagList items={lecture.skills} />
            </div>
            {/* Lớp đang dạy */}
            <SectionTitle>🏫 Lớp Đang Dạy</SectionTitle>
            <div className="ld-row">
                <span className="ld-row__label">Lớp</span>
                <TagList items={lecture.assignedClasses} />
            </div>
            {/* Lương */}
            <SectionTitle>💰 Thông Tin Lương</SectionTitle>
            <div className="ld-grid">
                <InfoRow label="Hình Thức" value={lecture.salaryType === 'hourly' ? 'Lương Giờ' : 'Lương Tháng'} />
                <InfoRow label="Lương Tháng" value={lecture.monthSalary ? `${formatVND(lecture.monthSalary)}` : '-'} />

                <InfoRow label="Đơn Giá" value={lecture.hourRate ? `${lecture.hourRate}/h` : '-'} />
                <InfoRow label="Tổng Giờ" value={lecture.totalHours ? `${lecture.totalHours}/h` : '-'} />
            </div>
            {/* Thời gian */}
            <SectionTitle>🕐 Thời Gian</SectionTitle>
            <div className="ld-grid">
                <InfoRow label='Ngày Tạo' value={formatDateDisplay(lecture.createdAt)} />
                <InfoRow label='Cập Nhật' value={formatDateDisplay(lecture.updatedAt)} />
            </div>
            {/* Footer */}
            <div className="ld-footer">
                <button className="btn btn--outline" onClick={onClose}>Đóng</button>
            </div>
        </Modal>
    )
}
