import { DAY_MAP, TABLE_HEADERS } from "@/constants/home/enrollmentstatusmodal.constants";
import React, { useState } from "react";
import AssignClassPopup from "./AssignClassPopup";

export default function LectureAssignmentTable({
    visibleRows,
    onGoToClass,
    courseDemands = [],
    onGoToSchedule,
    //   onGoToLecture

}) {
    const [assignTarget, setAssignTarget] = useState(null);
    // ── Handler: click "+ Phân công lớp" ─────────────────────────────────────
    const handleOpenAssignPopup = (row) => {
        setAssignTarget({
            lectureId: row.lectureId,
            lectureName: row.lectureName,
            specialty: row.specialty
        })
    }
    // Handler: chọn course trong popup → navigate

    const handleSelectCourse = (courseId) => {
        setAssignTarget(null);
        onGoToClass(assignTarget.lectureId, courseId)
    }

    return (
        <>
            <div className="enroll-table">
                <table className="enroll-table__inner">
                    <thead>
                        <tr>
                            {TABLE_HEADERS.map(h => (
                                <th key={h} className="enroll-table__th">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleRows.length === 0 ? (
                            <tr>
                                <td colSpan={TABLE_HEADERS.length} className="enroll-table__empty">
                                    Không có dữ liệu phù hợp
                                </td>
                            </tr>
                        ) : (
                            visibleRows.map((row, idx) => {
                                // Mapping trạng thái giống EnrollmentTable
                                const st =
                                    row.status === "COMPLETE"
                                        ? { label: "Đủ lớp & lịch", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" }
                                        : row.status === "NO_SCHEDULE"
                                            ? { label: "Chờ xếp lịch", bg: "#fffbeb", color: "#d97706", border: "#fde68a" }
                                            : { label: "Chưa có lớp", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" };

                                return (
                                    <tr
                                        key={`${row.lectureId}-${row.classId ?? "none"}`}
                                        className={`enroll-table__row ${idx % 2 === 0 ? "is-even" : "is-odd"}`}
                                    >
                                        {/* Giáo viên */}
                                        <td className="enroll-table__cell">
                                            <div className="enroll-table__student-name">{row.lectureName}</div>
                                            <div className="enroll-table__student-code">{row.lectureCode}</div>
                                        </td>

                                        {/* Chuyên môn */}
                                        <td className="enroll-table__cell">{row.specialty}</td>

                                        {/* Lớp được phân công */}
                                        <td className="enroll-table__cell">
                                            {row.classCode ? (
                                                <>
                                                    <div className="enroll-table__class-code">{row.classCode}</div>
                                                    <div className="enroll-table__class-status">{row.classStatus}</div>
                                                </>
                                            ) : (
                                                <button
                                                    className="enroll-table__btn enroll-table__btn--assign"
                                                    // onClick={() => onGoToClass(row.lectureId)}
                                                    // onClick={() => setAssignTarget(row)}
                                                    onClick={() => handleOpenAssignPopup(row)}
                                                >
                                                    + Giao lớp
                                                </button>
                                            )}
                                        </td>

                                        {/* Lịch dạy */}
                                        <td className="enroll-table__cell">
                                            {row.startTime ? (
                                                <div>
                                                    <div className="enroll-table__schedule-time">
                                                        {row.startTime} – {row.endTime}
                                                    </div>
                                                    <div className="enroll-table__schedule-meta">
                                                        {row.days.map(d => DAY_MAP[d] || d).join(", ")}
                                                        {row.room && ` · ${row.room}`}
                                                    </div>
                                                </div>
                                            ) : row.classCode ? (
                                                <button
                                                    className="enroll-table__btn enroll-table__btn--schedule"
                                                    onClick={() => onGoToSchedule(row.classId)}
                                                >
                                                    + Thêm lịch
                                                </button>
                                            ) : (
                                                <span className="enroll-table__dash">—</span>
                                            )}
                                        </td>

                                        {/* Trạng thái */}
                                        <td className="enroll-table__cell">
                                            <span
                                                className="enroll-table__status-pill"
                                                style={{
                                                    background: st.bg,
                                                    color: st.color,
                                                    borderColor: st.border
                                                }}
                                            >
                                                {st.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            {/* ── Popup chọn course để tạo lớp mới ── */}
            {assignTarget && (
                <AssignClassPopup
                    isOpen={!!assignTarget}
                    lecture={assignTarget}
                    onCancel={() => setAssignTarget(null)}
                    courseDemands={courseDemands}
                    onSelect={handleSelectCourse}
                />
            )}

        </>

    );
}
