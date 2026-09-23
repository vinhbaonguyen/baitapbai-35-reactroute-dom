import React, { useEffect } from 'react'
import { DAY_MAP, ENROLLTABLE_COLUMN_NAME, ENROLLTABLE_SCHEDULE_STATUS } from '@/constants/home/enrollmentstatusmodal.constants';

export default function EnrollmentTable({
    visibleRows,
    onGoToClass,
    onGoToSchedule
}) {
    useEffect(() => {
        console.log("visibleRows in EnrollmentTable", visibleRows)
    }, [visibleRows])
    return (
        <div className='enroll-table'>
            <table className="enroll-table__inner">
                <thead>
                    <tr>
                        {ENROLLTABLE_COLUMN_NAME.map(h => (
                            <th key={h} className='enroll-table__th'>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {visibleRows.length === 0
                        ? (
                            <tr>
                                <td colSpan={5} className="enroll-table__empty">
                                    Không có dữ liệu phù hợp
                                </td>
                            </tr>
                        )
                        : (
                            visibleRows.map((row, idx) => {
                                const st = ENROLLTABLE_SCHEDULE_STATUS[row.status];
                                return (
                                    <tr
                                        key={`${row.studentId}-${row.courseId}`}
                                        className={`enroll-table__row ${idx % 2 === 0 ? "is-even" : "is-odd"}`}
                                    >
                                        {/* Học viên */}
                                        <td className="enroll-table__cell">
                                            <div className='enroll-table__student-name'>{row.studentName}</div>
                                            <div className='enroll-table__student-code'>{row.studentCode}</div>
                                        </td>
                                        {/* Khóa học */}
                                        <td className="enroll-table__cell">
                                            <span className='enroll-table__course'>{row.courseName}</span>
                                        </td>
                                        {/* Lớp học */}
                                        <td className="enroll-table__cell">
                                            {row.classCode
                                                ? (
                                                    <>
                                                        <div className="enroll-table__class-code">{row.classCode}</div>
                                                        <div className="enroll-table__class-status">{row.classStatus}</div>
                                                    </>
                                                )
                                                : (
                                                    <button
                                                        onClick={() => onGoToClass(row.courseId)}
                                                        className='enroll-table__btn enroll-table__btn--assign'
                                                    >
                                                        + Xếp lớp
                                                    </button>
                                                )
                                            }
                                        </td>
                                        {/* Lịch học */}
                                        <td className="enroll-table__cell">
                                            {row.startTime
                                                ? (
                                                    <>
                                                        <div className='enroll-table__schedule-time'>
                                                            {row.startTime} - {row.endTime}
                                                        </div>
                                                        <div className='enroll-table__schedule-meta'>
                                                            {row.days.map(d => DAY_MAP[d] || d).join(', ')}
                                                            {row.room && ` ・ ${row.room}`}
                                                        </div>
                                                    </>

                                                )
                                                : row.classCode
                                                    ? (
                                                        <button
                                                            className='enroll-table__btn enroll-table__btn--schedule'
                                                            onClick={() => onGoToSchedule(row.classId)}
                                                        >
                                                            + Thêm lịch
                                                        </button>
                                                    )
                                                    : (
                                                        <span className="enroll-table__dash">-</span>
                                                    )
                                            }
                                        </td>
                                        {/* Trạng thái */}
                                        <td className='enroll-table__cell'>
                                            <span
                                                className='enroll-table__status-pill'
                                                style={{
                                                    background: st.bg,
                                                    color: st.color,
                                                    borderColor: st.border
                                                }}
                                            >
                                                {st.icon} {st.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                </tbody>
            </table>
        </div>
    );
}
