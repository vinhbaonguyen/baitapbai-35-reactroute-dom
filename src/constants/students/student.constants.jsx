export const STUDENT_TABLE_COLUMNS = [
    { field: 'studentCode', label: 'Mã SV' },
    { field: 'studentName', label: 'Tên Sinh Viên' },
    { field: 'status', label: 'Trạng thái', type: 'status' },
    { field: 'courseNames', label: 'Khóa học' },
    // { field: 'hasPaidFee', label: 'Học Phí' }
    {
        field: 'paidSummary',
        label: 'Học Phí',
        render: (row) => {
            const text = row.paidSummary || '--';
            // Lấy số đầu tiên trước dấu '/'
            const paidCount = parseInt(text.split('/')[0], 10);
            const isPaid = paidCount > 0; // Nếu có ít nhất 1 khóa học đã đóng học phí → đánh dấu là đã đóng
            return (
                <div className={`badge badge--${isPaid ? 'active' : 'inactive'}`}>
                    {text} <br />
                    {isPaid ? 'Đã đóng' : 'Chưa đóng'}
                </div>

            );
        }
    }
]

export const STUDENT_SORT_OPTIONS = [
    { value: 'studentCode', label: 'Theo Mã SV' },
    { value: 'studentName', label: 'Theo Tên Sinh Viên' },
    { value: 'courseId', label: 'Theo Khóa Học' },
    { value: 'status', label: 'Theo Trạng thái' },
    { value: 'hasPaidFee', label: 'Theo Học Phí' }
]

//2. Tùy chọn Trạng thái (Dùng cho DataTable badge và StatusPicker)
export const STUDENT_STATUS_OPTIONS = [
    { value: 'Studying', label: 'Đang học', color: 'green', icon: '🟢' },
    { value: 'Dropped', label: 'Bỏ học giữa chừng', color: 'red', icon: '🔴' },
    { value: 'Pending', label: 'Chờ duyệt', color: 'orange', icon: '🟡' },
    { value: 'Suspended', label: 'Tạm đình chỉ', color: 'purple', icon: '🟣' },
    { value: 'Completed', label: 'Kết thúc', color: 'gray', icon: '⚪' }
];