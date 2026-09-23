import { getModalStyle } from '@/constants/modalStyles';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Draggable from 'react-draggable';
import Modal from 'react-modal'
import EnrollmentHeader from './components/EnrollmentHeader';
import { getSummaryPills } from '@/constants/home/enrollmentstatusmodal.constants';
import EnrollmentToolbar from './components/EnrollmentToolbar';
import EnrollmentSummary from './components/EnrollmentSummary';
import LectureAssignmentTable from './components/LectureAssignmentTable';
import EnrollmentFooter from './components/EnrollmentFooter';
// ── Component ────────────────────────────────────────────────────────────────
/**
 * LectureAssignmentModal
 * Hiển thị tình hình xếp lớp + lịch dạy của toàn bộ giáo viên
 *
 * Props:
 *  - isOpen         : boolean
 *  - lectures       : array từ Redux
 *  - classes        : array từ Redux
 *  - classSchedules : array từ Redux
 *  - courseMap      : { [courseId]: courseName } từ useLookupMaps
 *  - onClose        : () => void
 *  - onGoToClass    : (lectureId?) => void  — navigate('/app/class')
 *  - onGoToSchedule : () => void            — navigate('/app/schedule')
 *  - onGoToLecture  : () => void            — navigate('/app/lecture')
 */
export default function Lectureassignmentmodal({
    isOpen,
    lectures = [],
    classes = [],
    classSchedules = [],
    courseMap = {},
    onClose,
    courseDemands=[],
    onGoToClass,
    onGoToSchedule,
    // onGoToLecture

}) {
    const [activeFiter, setActiveFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const nodeRef = useRef(null);
    // state quản lý đóng mở popup chọn course để phân công class cho lecture
   
    // ── Build rows: mỗi giáo viên × mỗi lớp được phân công ─────────────────
    // Tương tự Enrollment: mỗi (student × course) → 1 row
    // Ở đây:            mỗi (lecture × class)   → 1 row
    // Giáo viên chưa có lớp → vẫn có 1 row với status NO_CLASS

    const allRows = useMemo(() => {
        const rows = []

        lectures.forEach(lec => {
            // Tìm tất cả lớp Active/Planned được giao cho giáo viên này
            const assignedClasses = classes.filter(c =>
                Number(c.lectureId) === Number(lec.id)
                && (c.status === 'Active' || c.status === 'Planned' || c.status === 'Archived')
            )
            if (assignedClasses.length === 0) {
                rows.push({
                    lectureId: lec.id,
                    lectureCode: lec.lectureCode,
                    lectureName: lec.lectureName,
                    specialty: lec.specialty || '--',
                    lectureStatus: lec.status,
                    classId: null,
                    classCode: null,
                    classStatus: null,
                    courseName: null,
                    days: [],
                    startTime: null,
                    endTime: null,
                    room: null,
                    status: 'NO_CLASS'
                })
                return
            }
            // Có lớp → mỗi lớp là 1 row
            assignedClasses.forEach(cls => {
                const schedule = classSchedules.find(
                    s => Number(s.classId) === Number(cls.id)
                )
                const courseName = courseMap[Number(cls.courseId)] || `ID:${cls.courseId}`

                const status = !schedule ? 'NO_SCHEDULE' : 'COMPLETE'

                rows.push({
                    lectureId: lec.id,
                    lectureCode: lec.lectureCode,
                    lectureName: lec.lectureName,
                    specialty: lec.specialty || '--',
                    lectureStatus: lec.status,
                    classId: cls.id,
                    classCode: cls.classCode,
                    classStatus: cls.status,
                    courseName,
                    days: schedule?.days ?? [],
                    startTime: schedule?.startTime ?? null,
                    endTime: schedule?.endTime ?? null,
                    room: schedule?.room ?? null,
                    status,
                })
            })
        })

        return rows
    }, [lectures, classes, classSchedules, courseMap])
    // ── Summary ──────────────────────────────────────────────────────────────

    const summary = useMemo(() => ({
        total: lectures.length,
        complete: allRows.filter(r => r.status === 'COMPLETE').length,
        noSchedule: allRows.filter(r => r.status === 'NO_SCHEDULE').length,
        noClass: allRows.filter(r => r.status === 'NO_CLASS').length
    }), [lectures, allRows])

    const summaryPills = getSummaryPills(summary)

    useEffect(()=>{
        console.log(summaryPills);
        
    },[])

    // ── Filter + Search ──────────────────────────────────────────────────────
    const visibleRows = useMemo(() => {
        return allRows
            .filter(r => activeFiter === 'ALL' || r.status === activeFiter)
            .filter(r => {
                if (!search) return true;
                const q = search.toLowerCase();
                return (
                    r.lectureName?.toLowerCase().includes(q) ||
                    r.specialty?.toLowerCase().includes(q) ||
                    r.classCode?.toLowerCase().includes(q) ||
                    r.couirseName?.toLowerCase().includes(q)
                )
            })
    }, [allRows, activeFiter, search])

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={getModalStyle('620px')}
            shouldFocusAfterRender={false}
            shouldReturnFocusAfterClose={false}
            ariaHideApp={false}
            contentElement={(props, children) => (
                <Draggable
                    handle='.enroll-modal__header'
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
            {/* ── Header ── */}
            <EnrollmentHeader
                title='👨‍🏫 Tổng quan xếp lớp Giáo Viên'
                desc='Theo dõi từng giáo viên → lớp được phân công → lịch dạy'
                onClose={onClose}
            />
            {/* ── Summary pills ── */}
            <EnrollmentSummary
                summary={summary}
                summaryPills={summaryPills}
            />

            {/* ── Toolbar: filter + search ── */}
            {/* ── Summary pills ── */}
            <EnrollmentToolbar
                activeFilter={activeFiter}
                setActiveFilter={setActiveFilter}
                summary={summary}
                search={search}
                setSearch={setSearch}
            />
            <LectureAssignmentTable
                visibleRows={visibleRows}
                onGoToClass={onGoToClass}
                onGoToSchedule={onGoToSchedule}
                courseDemands={courseDemands}
            />
            <EnrollmentFooter
                visibleRows={visibleRows}
                allRows={allRows}
                onClose={onClose}
            />
        </Modal>
    )
}
