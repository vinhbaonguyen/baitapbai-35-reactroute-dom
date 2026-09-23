import { FILTERS } from '@/constants/home/enrollmentstatusmodal.constants'
import React from 'react'

export default function EnrollmentToolbar({
    activeFilter,
    setActiveFilter,
    summary,
    search,
    setSearch
}) {
    return (
        <div className="enroll-toolbar">
            <div className="enroll-toolbar__filters">
                {FILTERS.map(f => (
                    <button
                        key={f.key}
                        className={`enroll-toolbar__filter-btn ${activeFilter === f.key
                            ? 'enroll-toolbar__filter-btn--active'
                            : ''}`}
                        onClick={() => setActiveFilter(f.key)}
                    >
                        {f.label}
                        {f.key !== 'ALL' && (
                            <span className="enroll-toolbar__filter-count">
                                ({f.key === 'NO_CLASS' ? summary.noClass
                                    : f.key === 'NO_SCHEDULE' ? summary.noSchedule
                                        : summary.complete
                                }) 
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <input
                className='enroll-toolbar__search'
                placeholder='🔍 Tìm học viên, khóa học, lớp...'
                onChange={e => setSearch(e.target.value)}
                value={search}
            />
        </div>
    )
}
