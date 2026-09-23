export const getSummaryPillsConfig = (summary = {}) => [
    { label: 'Tổng lượt đăng ký', value: summary.total, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Hoàn tất', value: summary.complete, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Chưa có lịch', value: summary.noSchedule, color: '#d97706', bg: '#fffbeb' },
    { label: 'Chưa xếp lớp', value: summary.noClass, color: '#dc2626', bg: '#fef2f2' }
]


export const  ENROLLTABLE_SCHEDULE_STATUS = {
    COMPLETE: { label: 'Hoàn tất', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '✅' },
    NO_SCHEDULE: { label: 'Chưa có lịch', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '📅' },
    NO_CLASS: { label: 'Chưa xếp lớp', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '❌' },
}

export const FILTERS = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'NO_CLASS', label: '❌ Chưa xếp lớp' },
    { key: 'NO_SCHEDULE', label: '📅 Chưa có lịch' },
    { key: 'COMPLETE', label: '✅ Hoàn tất' },
]

export const DAY_MAP = {
    Mon: 'T2', Tue: 'T3', Wed: 'T4',
    Thu: 'T5', Fri: 'T6', Sat: 'T7', Sun: 'CN'
}

// Dùng cho Enrollmentsattusmodal
export const ENROLLTABLE_COLUMN_NAME = [
    'Học viên', 'Khóa học', 'Lớp học', 'Lịch học', 'Trạng thái'
]

// dùng cho Lectureassignmentmodal
export const TABLE_HEADERS = ['Giáo viên', 'Chuyên môn', 'Lớp được phân công', 'Lịch dạy', 'Trạng thái']

export function getSummaryPills(summary) {
    return [
        { label: 'Tổng GV',        value: summary.total,      color: '#6366f1', bg: '#eef2ff' },
        { label: 'Đủ lớp & lịch',  value: summary.complete,   color: '#16a34a', bg: '#f0fdf4' },
        { label: 'Chờ xếp lịch',   value: summary.noSchedule, color: '#d97706', bg: '#fffbeb' },
        { label: 'Chưa có lớp',    value: summary.noClass,    color: '#dc2626', bg: '#fef2f2' },
    ]
}