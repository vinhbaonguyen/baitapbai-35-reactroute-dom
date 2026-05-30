// Config riêng của Course cho TableData Component
export const COURSE_TABLE_COLUMNS = [
  { field: 'courseCode', label: 'Mã Khóa Học' },
  { field: 'courseName', label: 'Tên Khóa Học' },
  {
    field: 'coursePeriod',
    label: 'Thời Gian',
    render: (row) => row.coursePeriod ? `${row.coursePeriod} giờ` : ''

  },
  { field: 'status', label: 'Trạng Thái' },
  { field: 'category', label: 'Lĩnh Vực' },
]
//SORT_OPTIONS cho Toolbar Component
export const COURSE_SORT_OPTIONS = [
  { value: 'courseCode', label: 'Theo Mã Khóa Học' },
  { value: 'courseName', label: 'Theo Tên Khóa Học' },
  { value: 'coursePeriod', label: 'Theo Thời Gian' },
  { value: 'status', label: 'Theo Trạng Thái' },
  { value: 'category', label: 'Theo Lĩnh Vực' },

]

export const COURSE_STATUS_OPTIONS = [
  { value: 'Active', label: 'active', color: 'green', icon: '🟢' },
  { value: 'Inactive', label: 'inactive', color: 'red', icon: '🔴' },
  { value: 'Pending', label: 'pending', color: 'orange', icon: '🟡' },
  { value: 'Finished', label: 'finished', color: 'gray', icon: '⚪' }
];