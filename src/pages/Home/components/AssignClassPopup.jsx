import { getModalStyle } from '@/constants/modalStyles'
import React, { useRef } from 'react'
import Draggable from 'react-draggable'
import Modal from 'react-modal'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
// 2. Định nghĩa variants cho Container và các Items
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08 // Hiệu ứng xuất hiện tuần tự giữa các item
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
}
export default function AssignClassPopup({
    isOpen,
    lecture,
    courseDemands = [],
    onSelect,
    onCancel }) {

    const nodeRef = useRef(null)
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onCancel}
            style={getModalStyle('520px')}
            shouldFocusAfterRender={false}
            shouldReturnFocusAfterClose={false}
            ariaHideApp={false}
            contentElement={(props, children) => (
                <Draggable
                    handle='.assign__header'
                    nodeRef={nodeRef}
                    defaultPosition={{ x: -240, y: -360 }}
                    position={null}
                >
                    <div {...props} ref={nodeRef}>
                        {children}
                    </div>
                </Draggable>
            )}
        >
            {/* Header */}
            <div className="assign__header">
                <div className='assign__header-infor'>
                    <div className="assign__title">
                        👨‍🏫 Phân công lớp cho thầy {lecture?.lectureName}
                    </div>
                    <div className="assign__subtitle">
                        Chuyên môn: {lecture?.specialty}
                    </div>
                </div>
                <button className="assign__close-btn" onClick={onCancel}>×</button>
            </div>

            {/* Body */}
            <div className="assign__body">
                <p className="assign__desc">
                    📌 Các khóa học đang có <strong>học viên chờ xếp lớp</strong>.
                    Chọn một khóa để tạo lớp mới và phân công cho giáo viên này:
                </p>

                {courseDemands.length === 0 ? (
                    <div className="assign__empty">
                        🎉 Không có học viên nào chờ xếp lớp
                    </div>
                ) : (
                    /* 3. Thay đổi div thành motion.div và thêm variants cho List Container */
                    <motion.div
                        className="assign__list"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"

                    >
                        {courseDemands.map(d => (
                            /* 4. Thay đổi item thành motion.div, thêm variants và hiệu ứng hover/tap */
                            <motion.div
                                key={d.courseId}
                                className="assign__item"
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, x: 5 }} // Nhẹ nhàng zoom và dịch sang phải khi hover
                                whileTap={{ scale: 0.98 }}         // Hiệu ứng lún xuống khi click
                                onClick={() => onSelect(d.courseId)}
                            >

                                <div className='assign__item-left'>
                                    <div className="assign__course-name">
                                        📚 {d.courseName}
                                    </div>

                                    <div className="assign__students">
                                        Học viên chờ xếp lớp:{' '}
                                        <span className="assign__students-list">
                                            {d.studentNames.slice(0, 3).join(", ")}
                                            {d.studentNames.length > 3 &&
                                                ` +${d.studentNames.length - 3} người khác`}
                                        </span>
                                    </div>
                                </div>
                                <div className="assign__badge">
                                    <div className="assign__badge-count">
                                        {d.studentCount} HV
                                    </div>
                                    <div className="assign__badge-note">
                                        → Tạo lớp mới
                                    </div>
                                </div>


                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
            {/* Footer */}
            <div className="assign__footer">
                <button className="assign__cancel-btn" onClick={onCancel}>
                    Hủy
                </button>
            </div>
        </Modal>
    )
}
