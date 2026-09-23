import { getSummaryPillsConfig } from '@/constants/home/enrollmentstatusmodal.constants';
import { getModalStyle } from '@/constants/modalStyles';
import React, { useRef, useState } from 'react'
import { useMemo } from 'react';
import Draggable from 'react-draggable';
import Modal from 'react-modal';
import EnrollmentSummary from './components/EnrollmentSummary';
import EnrollmentToolbar from './components/EnrollmentToolbar';
import EnrollmentTable from './components/EnrollmentTable';
import EnrollmentFooter from './components/EnrollmentFooter';
import EnrollmentHeader from './components/EnrollmentHeader';


// ── Component ──────────────────────────────────────────────────────────────
/**
 * EnrollmentStatusModal
 * Hiển thị toàn bộ trạng thái đăng ký khóa học + xếp lớp + lịch học
 * của tất cả học viên
 *
 * Props:
 *  - students       : array từ Redux
 *  - courses        : array từ Redux
 *  - classes        : array từ Redux
 *  - classSchedules : array từ Redux
 *  - studentClass   : array từ Redux (student_class junction)
 *  - courseMap      : { [courseId]: courseName } từ useLookupMaps
 *  - onClose        : () => void
 *  - onGoToClass    : () => void   — navigate('/app/class')
 *  - onGoToSchedule : () => void   — navigate('/app/schedule')
 */

export default function Enrollmentstatusmodal({
    isOpen,
    students = [],
    courses = [],
    classes = [],
    classSchedules = [],
    studentClass = [],
    studentCourse = [],
    // courseMap = {},
    onClose,
    onGoToClass,
    onGoToSchedule,
}) {
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [search, setSearch] = useState('')
    // ── Tính toàn bộ trạng thái ──────────────────────────────────────────
    const allRows = useMemo(() => {
        const rows = []
        students.forEach(s => {
            // Normalize courseId → luôn là array
            // const registeredCourseIds = Array.isArray(s.courseId)
            //     ? s.courseId.map(id => Number(id))
            //     : s.courseId ? [Number(s.courseId)] : []

            const registeredCourseIds = studentCourse
                .filter(sc => Number(sc.studentId) === Number(s.id))
                .map(sc => Number(sc.courseId))

            if (registeredCourseIds.length === 0) return;

            // classId student đang tham gia
            const classRecords = studentClass.filter(
                sc => Number(sc.studentId) === Number(s.id)
            )

            registeredCourseIds.forEach(cid => {
                const course = courses.find(c => Number(c.id) === cid)

                // Tìm lớp student đã tham gia cho course này
                const assignedClass = classRecords
                    .map(sc => classes.find(c => Number(c.id) === Number(sc.classId)))
                    .find(c => c && Number(c.courseId) === cid)

                // Tìm schedule của lớp
                const schedule = assignedClass
                    ? classSchedules.find(
                        sch => Number(sch.classId) === Number(assignedClass.id)
                    )
                    : null
                // Tính status
                let status
                if (!assignedClass) status = 'NO_CLASS'
                else if (!schedule) status = 'NO_SCHEDULE'
                else status = 'COMPLETE'
                const feeRecord = studentCourse.find(
                    sc =>
                        Number(sc.studentId === Number(s.id) &&
                            Number(sc.courseId) === cid)
                );

                rows.push({
                    studentId: s.id,
                    studentName: s.studentName,
                    studentCode: s.studentCode,
                    courseId: cid,
                    courseName: course?.courseName ?? `ID:${cid}`,
                    classCode: assignedClass?.classCode ?? null,
                    classId: assignedClass?.id ?? null,
                    classStatus: assignedClass?.status ?? null,
                    days: schedule?.days ?? [],
                    startTime: schedule?.startTime ?? null,
                    endTime: schedule?.endTime ?? null,
                    room: schedule?.room ?? null,
                    status,
                    hasPaidFee: feeRecord?.hasPaidFee ?? false,
                })
            })
        })
        return rows

    }, [students, courses, classes, classSchedules, studentClass, studentCourse])

    // ── Summary counts ────────────────────────────────────────────────────
    const summary = useMemo(() => ({
        total: allRows.length,
        complete: allRows.filter(r => r.status === 'COMPLETE').length,
        noSchedule: allRows.filter(r => r.status === 'NO_SCHEDULE').length,
        noClass: allRows.filter(r => r.status === 'NO_CLASS').length,
    }), [allRows])

    const summaryPills = useMemo(() => getSummaryPillsConfig(summary), [summary])

    // ── Filter + search ───────────────────────────────────────────────────
    const visibleRows = useMemo(() => {
        return allRows
            .filter(r => activeFilter === 'ALL' || r.status === activeFilter)
            .filter(r =>
                !search ||
                r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
                r.courseName?.toLowerCase().includes(search.toLowerCase()) ||
                r.classCode?.toLowerCase().includes(search.toLowerCase())
            )
    }, [allRows, activeFilter, search])

    const nodeRef = useRef(null)

    return (
        <Modal
            // isOpen={true}
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
                    defaultPosition={{ x: -220, y: -350 }}
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
                title='📋 Tổng quan đăng ký & xếp lớp'
                desc='Theo dõi từng học viên → khóa học → lớp học → lịch học'
                onClose={onClose}
            />

            {/* ── Summary pills ── */}
            <EnrollmentSummary
                summary={summary}
                summaryPills={summaryPills}
            />
            {/* ── Toolbar: filter + search ── */}
            <EnrollmentToolbar
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                summary={summary}
                summaryPills={summaryPills}
                search={search}
                setSearch={setSearch}
            />

            {/* ── Table ── */}
            <EnrollmentTable
                visibleRows={visibleRows}
                onGoToClass={onGoToClass}
                onGoToSchedule={onGoToSchedule}
            />

            {/* ── Footer ── */}
            <EnrollmentFooter
                visibleRows={visibleRows}
                allRows={allRows}
                onGoToClass={onGoToClass}
                onGoToSchedule={onGoToSchedule}
                onClose={onClose}
            />
        </Modal>
    )
}
