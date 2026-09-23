import React from 'react'

export default function EnrollmentSummary({ summary, summaryPills }) {
    const progress = summary.total > 0
        ? Math.round(summary.complete / summary.total * 100)
        : 0;
    return (
        <div className='enroll-summary'>
            <div className="enroll-summary__pills">
                {summaryPills.map(pill => (
                    <div
                        key={pill.label}
                        className='enroll-summary__pill'
                        style={{ borderColor: `${pill.color}30`, background: pill.bg }}
                    >
                        <div
                            className='enroll-summary__pill-value'
                            style={{ color: pill.color }}
                        >
                            {pill.value}
                        </div>
                        <div className="enroll-summary__pill-label">
                            {pill.label}
                        </div>
                    </div>
                ))}
            </div>
            <div className="enroll-summary__progress">
                <div className="enroll-summary__progress-label">
                    Tiến độ hoàn tất: {progress} %

                </div>
                <div className="enroll-summary__progress-bar">
                    <div
                        className="enroll-summary__progress-bar-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="enroll-summary__legend">
                    <span>🟢 {summary.complete} hoàn tất</span>
                    <span>🟡 {summary.noSchedule} chờ lịch</span>
                    <span>🔴 {summary.noClass} chờ lớp</span>
                </div>
            </div>
        </div>
    )
}
