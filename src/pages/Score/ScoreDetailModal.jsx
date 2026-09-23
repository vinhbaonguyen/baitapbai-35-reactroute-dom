import { getModalStyle } from '@/constants/modalStyles';
import { formatDateDisplay } from '@/utils/date.utils';
import React, { useRef } from 'react'
import Draggable from 'react-draggable';
import Modal from 'react-modal'
import '../Lecturer/LectureDetailModal.scss'  // dùng chung style với LectureDetailModal vì cấu trúc tương tự
// ── Helper components ───────────────────────────────────────────────
const SectionTitle = ({ children }) => (
    <p className="ld-section">{children}</p>
);

const InfoRow = ({ label, value }) => (
    <div className="ld-row">
        <span className="ld-row__label">{label}</span>
        <span className="ld-row__value">{value ?? '-'}</span>
    </div>
);
export default function ScoreDetailModal({score,onClose}) {
    const nodeRef = useRef(null);
    if (!score) return null;
  return (
    <Modal
        isOpen={true}
            onRequestClose={onClose}
            style={getModalStyle('520px')}
            shouldFocusAfterRender={false}
            shouldReturnFocusAfterClose={false}
            ariaHideApp={false}
            contentElement={(props, children) => (
                <Draggable
                    handle=".ld-header"
                    nodeRef={nodeRef}
                    defaultPosition={{ x: -180, y: -350 }}
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
                {score.studentName?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div>
                <h3 className="ld-header__name">{score.studentName}</h3>       
                <span className="ld-header__code">{score.classCode}</span>
                <span className="ld-header__code">{score.courseName}</span>
            </div>
            <button className="ld-close" onClick={onClose}>X</button>
        </div>
        {/* Thông tin thi */}
        <SectionTitle>📝 Thông Tin Thi</SectionTitle>
        <div className="ld-grid">
            <InfoRow label="Điểm lần 1" value={score.scoreAtFirstTime} />
            <InfoRow label="Ngày thi lần 1" value={formatDateDisplay(score.examDateFirstTime)} />
            <InfoRow label="Điểm lần 2" value={score.scoreAtSecondTime} />
            <InfoRow label="Ngày thi lần 2" value={formatDateDisplay(score.examDateSecondTime)} />
        </div>
        {/* Kết quả */}
        <SectionTitle>🎯 Kết Quả</SectionTitle>
        <div className="ld-grid">
            <InfoRow label="Điểm Cao Nhất" value={score.finalScore} />
            <InfoRow label="Kết quả" value={score.result} />
            <InfoRow label="Chứng chỉ" value={score.certificateIssued ? 'Đã cấp' : 'Chưa cấp'} />
        </div>
        {/* Ghi chú */}
        <SectionTitle>🗒️ Ghi Chú</SectionTitle>
        <div className="ld-row">
            <span className="ld-row__value">{score.note || 'Không có ghi chú'}</span>
        </div>
         {/* Thời gian */}
         <SectionTitle>🕒 Thời Gian</SectionTitle>
         <div className="ld-grid">
            <InfoRow label="Ngày tạo" value={formatDateDisplay(score.createdAt)} />
            <InfoRow label="Ngày cập nhật" value={formatDateDisplay(score.updatedAt)} />
         </div>
          {/* Footer */}
          <div className="ld-footer">
            <button className="btn btn--outline" onClick={onClose}>Đóng</button>
          </div>
    </Modal>
  )
}
