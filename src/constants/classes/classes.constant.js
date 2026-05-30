export const CLASSES_SORT_OPTION = [
    { value: 'classCode', label: 'Theo Mã Số Lớp' },
    // { value: 'className', label: 'Theo Tên Lớp' },
    { value: 'lectureId', label: 'Theo Tên Giáo Viên' },
    { value: 'classNumber', label: 'Theo Sĩ Số Lớp' },
    { value: 'status', label: 'Theo Trạng Thái' },
    { value: 'courseId', label: 'Theo Khóa học' },
]

export const CLASSES_TABLE_COLUMNS = [
    { field: 'classCode', label: 'Mã Số Lớp' },
    {
        field: 'lectureId',
        label: 'Tên Giáo Viên',
        type: 'relation',
        relationKey: 'lectureName'
    },
    { field: 'description', label: 'Mô tả' },
    { field: 'classNumber', label: 'Sĩ Số' },
    { field: 'status', label: 'Trạng Thái' },
    {
        field: 'courseId',
        label: 'Tên Khóa Học',
        type: 'relation',
        relationKey: 'courseName'
    },
]

export const CLASSES_STATUS_OPTIONS = [
    { value: 'Planned', label: 'Lớp Dự Kiến Mở', color: 'green', icon: '🟢' },
    { value: 'Active', label: 'Lớp Đang Học', color: 'blue', icon: '🔵' },
    { value: 'Paused', label: 'Lớp Tạm Dừng', color: 'orange', icon: '🟡' },
    { value: 'Completed', label: 'Lớp đã kết thúc', color: 'red', icon: '🔴' },
    { value: 'Cancelled', label: 'Lớp bị hủy', color: 'purple', icon: '🟣' },
    { value: 'Archived', label: 'Lớp Lưu Trữ', color: 'gray', icon: '⚪' }
];

export const BRAND_NAME = [
    { value: 'HN', label: 'Hà Nội' },
    { value: 'ĐN', label: 'Đà Nẵng' },
    { value: 'HCM', label: 'Hồ Chí Minh' },
]