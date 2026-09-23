import Modal from 'react-modal'
import React, { useMemo, useRef, useState } from 'react'
import { getModalStyle } from '@/constants/modalStyles'
// import { alertError } from '@/utils/alert'
import '../../components/PageComponent/PageComponent.scss'
import Draggable from 'react-draggable'
import { confirmPickerSelection } from '@/utils/confirmPickerSelection'

export default function CoursePickerModal({
    courseData = [],
    selected = null, // single: id | multi: [id, id]
    onSave,
    onClose,
    singleSelect = true, // ✅ mặc định single để ScoreModal không bị vỡ
    onEmptyConfirm
}) {


    // const [picked, setPicked] = useState(() => {
    //     if (singleSelect) return selected
    //     if (Array.isArray(selected)) return selected
    //     return selected ? [selected] : []
    // })

    // 1) Chuẩn hóa selected → picked (luôn unique)
    const normalizeSelected = () => {
        if (singleSelect) return selected != null ? Number(selected) : null
        if (Array.isArray(selected)) return [...new Set(selected.map(Number))]
        return selected ? [Number(selected)] : []
    }

    const [picked, setPicked] = useState(normalizeSelected())   

    // 2)------Search -----------------------------------------
    const [search, setSearch] = useState('');

    //  ── Filter ───────────────────────────────────────────
    const filtered = useMemo(() => {
        const s = search.toLowerCase();
        // console.log("Course Data hay Options", courseData);
        return courseData.filter(c => c.courseName.toLowerCase().includes(s))
    }, [search, courseData,])

    // 3)── Helpers ──────────────────────────────────────────────
    const isActive = (courseId) => {
        const cid = Number(courseId);
        return singleSelect
            ? picked === cid
            : picked.includes(cid)
    }
    // ------ Disable nút Xác nhận --------------------------
    // const isDisabled = singleSelect ? picked === null : picked.length === 0

    const totalSelected = singleSelect
        ? (picked ? 1 : 0)
        : picked.length

    // 4) Toggle chọn   
    const handlePick = (courseId) => {
        const cid = Number(courseId)
        if (singleSelect) {
            // Toggle: chọn lại chính nó → bỏ chọn
            setPicked(prev => prev === cid ? null : cid)
            return
        }
        // Multi-select: toggle thêm/bỏ
        setPicked(prev => prev.includes(cid)
            ? prev.filter(id => id !== cid)
            : [...prev, cid]
        )
    }
    // 5) Confirm   
    // const handleConfirm = async () => {
    //     const nothingSelected = singleSelect
    //         ? picked === null
    //         : picked.length === 0;

    //     if (nothingSelected) {
    //         const result = await alertConfirm({
    //             title: 'Bạn chưa chọn Khóa Học',
    //             confirmButtonText: 'Quay lại Chọn',
    //             cancelButtonText: 'Thoát'
    //         });

    //         if (result.isConfirmed) return;   // quay lại chọn
    //         if (result.isDismissed) {
    //             setPicked(singleSelect ? null : []); onClose()
    //             onClose(); 
    //             return
    //         }
    //     }
    //     // Luôn gửi mảng unique
    //     const finalPicked = singleSelect ? [picked] : [...new Set(picked)]
    //     onSave(finalPicked)
    // }

    const handleConfirm = () => confirmPickerSelection({
        picked,
        onSave: (val) => {
            // Chuẩn hóa về mảng unique trước khi trả ra ngoài
            const finalPicked = singleSelect ? [val] : [...new Set(val)]
            onSave(finalPicked)
        },
        onClose,
        onEmptyConfirm,
        emptyTitle:'Bạn chưa chọn Khóa Học'
    })  

    // 6) State dùng cho kéo thả modal
    const nodeRef = useRef(null)
    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            style={getModalStyle('840px')}
            shouldFocusAfterRender={false}
            shouldReturnFocusAfterClose={false}
            ariaHideApp={false}
            contentElement={(props, children) => (
                <Draggable
                    handle='.modal__header'
                    nodeRef={nodeRef}
                    defaultPosition={{ x: -490, y: -350 }}
                    position={null}
                >
                    <div {...props} ref={nodeRef}>
                        {children}
                    </div>
                </Draggable>
            )}
        >
            <h4 className='modal__header'>Chọn Khóa Học</h4>
            {/* Search box */}
            <input
                className='picker-other'
                placeholder='Tìm kiếm khóa học...'
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            {/* ── Tags hiển thị đã chọn (chỉ multi) ── */}
            {!singleSelect && picked.length > 0 && (
                <div className='picker-other-display'>
                    <p className='picker-other-display__quantity'>
                        Đã chọn ({totalSelected}) Khóa học
                    </p>
                    <div className='picker-other-display__content'>
                        {picked.map((courseId,Index) => {
                            const course = courseData.find(c => Number(c.id) === Number(courseId))
                            return (
                                <span key={`${courseId}-${Index}`} className='picker-other-display__skill'>
                                    {course?.courseName ?? `ID: (${courseId})`}
                                    <span
                                        className='picker-other-display__delete'
                                        onClick={() => handlePick(courseId)}
                                    >X</span>
                                </span>
                            )
                        })}
                    </div>
                </div>
            )

            }
            {/* Course list */}
            <div className='picker-grid__course'>
                {filtered.map(course => {

                    return (
                        <div
                            key={course.id}
                            className={`picker-item ${isActive(course.id) ? 'picker-item--active' : ''}`}
                            onClick={() => handlePick(course.id)}
                        >
                            <div className='picker-item__content'>
                                <p className='picker-item__content--label'>{course.courseName}</p>
                                <p className='picker-item__content--desc'>{course.coursePeriod} giờ</p>
                                <p className={`badge badge--${course?.status.toLowerCase()}`}>{course.status}</p>
                            </div>
                            {isActive(course.id) && (<span className='picker-item__check'>✓</span>)}
                        </div>
                    )
                })}
                {filtered.length === 0 && (
                    <p className='picker-item__content--desc'>
                        {courseData.length === 0
                            ? '⚠️ Học viên chưa đăng ký khóa học nào'
                            : 'Không tìm thấy khóa học phù hợp'
                        }
                    </p>
                )}
            </div>
            {/* Footer */}
            <div className="modal__footer">
                <button className='btn btn--outline' onClick={onClose}>Hủy</button>
                <button
                    className='btn btn--primary'
                    // disabled={!picked}
                    // disabled={isDisabled}
                    // onClick={() => onSave(picked)}
                    onClick={handleConfirm}
                >
                    {/* Text nút thay đổi theo mode */}
                    {singleSelect ? 'Xác nhận' : `Xác nhận (${totalSelected})`}

                </button>
            </div>
        </Modal>
    )
}
