//config fields của form — phần khác nhau giữa các trang
export const COURSE_FIELDS = [
  {
    name: 'courseCode',
    label: 'Mã Khóa Học',
    form: { type: 'text', hidden: false, disabled: true },
    table: { type: 'text' },
    history: { type: 'text' }
  },
  {
    name: 'courseName',
    label: 'Tên Khóa Học',
    form: { type: 'text', hidden: false, disabled: false, required: true },
    table: { type: 'text' },
    history: { type: 'text' }
  },
  {
    name: 'coursePeriod',
    label: 'Thời Gian (giờ)',
    form: { type: 'number', required: true },
    table: { type: 'number' },
    history: { type: 'number' }
  },
  {
    name: 'status',
    label: 'Trạng Thái',
    form: {
      type: 'select',
      options: ['Active', 'Inactive', 'Pending', 'Finished'],
      required: true,
      skipRender: false
    },
    table: { type: 'status' },
    history: { type: 'text' }
  },
  {
    name: 'category',
    label: 'Lĩnh Vực',
    form: {
      required: true,
      // type: 'text',
      type: 'picker',
      inputType: 'picker',
      pickerKey: 'categoryPicker',
      disabled: false,
      placeholder: 'Chọn Lĩnh Vực'
    },
    table: { type: 'text' },
    history: { type: 'text' }
  },
  {
    name: 'createdAt',
    label: 'Tạo mới ngày',
    form: { type: 'date', compare: false, hidden: true },
    table: { type: 'date' },
    history: { type: 'date' }
  },
  {
    name: 'updatedAt',
    label: 'Ngày cập nhật',
    form: { type: 'date', hidden: true, compare: false },
    table: { type: 'date' },
    history: { type: 'date' }
  }
]
