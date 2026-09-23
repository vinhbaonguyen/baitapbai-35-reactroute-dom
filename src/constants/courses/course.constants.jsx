import { formatVND } from "@/utils/formatVND";


// Config riêng của Course cho TableData Component
export const COURSE_TABLE_COLUMNS = [
  { field: 'courseCode', label: 'Mã Khóa Học' },
  { field: 'courseName', label: 'Tên Khóa Học' },
  {
    field: 'coursePeriod',
    label: 'Thời Gian',
    render: (row) => row.coursePeriod ? `${row.coursePeriod} giờ` : ''
  },
  // ✅ THÊM MỚI: Cột Học Phí với format tiền VNĐ
  {
    field: 'tuitionFee',
    label: 'Học Phí',
    render: (row) => formatVND(row.tuitionFee)
  },
  { field: 'status', label: 'Trạng Thái' },
  { field: 'specialtyName', label: 'Lĩnh Vực' },
]
//SORT_OPTIONS cho Toolbar Component
export const COURSE_SORT_OPTIONS = [
  { value: 'courseCode', label: 'Theo Mã Khóa Học' },
  { value: 'courseName', label: 'Theo Tên Khóa Học' },
  { value: 'coursePeriod', label: 'Theo Thời Gian' },
  { value: 'tuitionFee', label: 'Theo Học Phí' },
  { value: 'status', label: 'Theo Trạng Thái' },
  { value: 'category', label: 'Theo Lĩnh Vực' },
]

export const COURSE_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', color: 'green', icon: '🟢' },
  { value: 'INACTIVE', label: 'Inactive', color: 'red', icon: '🔴' },
  { value: 'PENDING', label: 'Pending', color: 'orange', icon: '🟡' },
  { value: 'FINISHED', label: 'Finished', color: 'gray', icon: '⚪' }
];