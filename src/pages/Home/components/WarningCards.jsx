import React from 'react'
import WarningCard from './WarningCard'
// 1. Import motion từ framer-motion
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

// 2. Định nghĩa các kịch bản xuất hiện (Variants)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15 // Mỗi card xuất hiện cách nhau 0.15 giây
        }
    }
}

const cardVariants = {
    hidden: { opacity: 0, y: 30 }, // Ban đầu ẩn và nằm dưới 30px
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { type: 'spring', stiffness: 100, damping: 15 } // Hiệu ứng nảy nhẹ (spring)
    }
}

export default function WarningCards({
    studentsWithUnassigned,
    classesNoSchedule,
    lecturesWithoutClass,
    onGoEnroll,
    onGoSchedule,
    onGoLecture
}) {
    return (
        /* 3. Thay đổi div lưới thành motion.div để kích hoạt hiệu ứng stagger */
        <motion.div 
            className="warning-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Card 1 */}
            <WarningCard
                type="danger"
                icon="⚠️"
                title={`${studentsWithUnassigned.length} học viên chưa xếp lớp`}
                items={studentsWithUnassigned}
                variants={cardVariants} // 4. Truyền kịch bản chuyển động vào card
                renderItem={(s) => (
                    <div key={s.studentId} className="warning-row">
                        <div className="warning-row__user">👤 {s.studentName}</div>
                        <div className="warning-row__badges">
                            {s.courseDetails.map(c => (
                                <span
                                    key={c.courseId}
                                    className={`warning-row__badge-item ${
                                        c.assigned 
                                            ? 'warning-row__badge-item--success' 
                                            : 'warning-row__badge-item--skill'
                                    }`}
                                >
                                    {c.assigned ? `✅ ${c.courseName} → ${c.classCode}` : `${c.courseName}`}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                footer={<button className="warning-btn" onClick={onGoEnroll}>Xem Chi tiết →</button>}
            />

            {/* Card 2 */}
            <WarningCard
                type="warning"
                icon="📅"
                title={`${classesNoSchedule.length} lớp chưa có lịch`}
                items={classesNoSchedule}
                variants={cardVariants} // 4. Truyền kịch bản chuyển động vào card
                renderItem={(c) => (
                    <div key={c.id} className="warning-row">
                        <div className="warning-row__badges" style={{ paddingLeft: 0 }}>
                            <span className="warning-row__badge-item warning-row__badge-item--class-code">
                                📖 {c.classCode} - {c.courseName} (Sỹ Số : {c.classNumber})
                            </span>
                        </div>
                    </div>
                )}
                footer={<button className="warning-btn" onClick={onGoSchedule}>Thêm lịch ngay →</button>}
            />

            {/* Card 3 */}
            <WarningCard
                type="info"
                icon="👨‍🏫"
                title={`${lecturesWithoutClass.length} giáo viên chưa có lớp`}
                items={lecturesWithoutClass}
                variants={cardVariants} // 4. Truyền kịch bản chuyển động vào card
                renderItem={(l) => (
                    <div key={l.lectureId} className="warning-row">
                        <div className="warning-row__user">👤 {l.lectureName}</div>
                        <div className="warning-row__badges">
                            <span className="warning-row__badge-item warning-row__badge-item--skill">📚 {l.specialty}</span>
                            <span className={`warning-row__badge-item warning-row__badge-item--status-${l.status.toLowerCase()}`}>
                                Trạng thái: {l.status}
                            </span>
                        </div>
                    </div>
                )}
                footer={<button className="warning-btn" onClick={onGoLecture}>Xem Chi Tiết →</button>}
            />
        </motion.div>
    )
}