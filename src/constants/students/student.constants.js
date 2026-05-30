export const STUDENT_TABLE_COLUMNS = [
    { field: 'studentCode', label: 'Mã SV' },
    { field: 'studentName', label: 'Tên Sinh Viên' },   
    { field: 'gender', label: 'Giới tính' },   
    { field: 'status', label: 'Trạng thái', type: 'status' },   
]

export const STUDENT_SORT_OPTIONS = [
    { value: 'studentCode', label: 'Theo Mã SV' },
    { value: 'studentName', label: 'Theo Tên Sinh Viên' },
    { value: 'gender', label: 'Theo Giới tính'},
    { value: 'status', label: 'Theo Trạng thái'}
]

//2. Tùy chọn Trạng thái (Dùng cho DataTable badge và StatusPicker)
export const STUDENT_STATUS_OPTIONS = [
    { value: 'Studying', label: 'Đang học', color: 'green', icon: '🟢' },
    { value: 'Dropped', label: 'Bỏ học giữa chừng', color: 'red', icon: '🔴' },
    { value: 'Pending', label: 'Chờ duyệt', color: 'orange', icon: '🟡' },   
    { value: 'Suspended', label: 'Tạm đình chỉ', color: 'purple', icon: '🟣' },
    { value: 'Completed', label: 'Kết thúc', color: 'gray', icon: '⚪' }
];