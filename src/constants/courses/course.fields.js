import { COURSE_STATUS_OPTIONS } from "./course.constants";

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
    name: 'tuitionFee',
    label: 'Học phí(VNĐ)',
    form: {
      type: 'number',
      required: false,
      placeholder: 'Nhập học phí (để trống = miễn phí)',
      format: 'currency' // hiển thị giá trị viết theo kiểu ~ VND 86.000 
    },
    table: { type: 'currency' },
    history: { type: 'number' }
  },
  {
    name: 'status',
    label: 'Trạng Thái',
    form: {
      type: 'select',
      // options: ['ACTIVE', 'INACTIVE', 'PENDING', 'FINISHED'],     
      options: COURSE_STATUS_OPTIONS, // cùng 1 nguồn dữ liệu trong course.constants.js
      required: true,
      skipRender: false
    },
    table: { type: 'status' },
    history: { type: 'text' }
  },
  {
    name: 'specialtyName',  // name: 'category' → đổi thành specialtyName để thống nhất với backend,
    label: 'Lĩnh Vực',
    form: {
      required: true,
      // type: 'text',
      type: 'picker',
      inputType: 'picker',
      pickerKey: 'categoryPicker',
      disabled: false,
      placeholder: 'Chọn Lĩnh Vực',
      skipSubmit: true,  // ✅ chỉ hiển thị UI, KHÔNG gửi API
      compare: false      // ✅ KHÔNG đưa vào compareData (Course page quản lý)
    },
    table: { type: 'text' },
    history: { type: 'text' }
  },
  {
    name: 'specialtyId',  // thêm trường specialtyId để gửi API
    label: 'Lĩnh Vực ID',
    form: {
      type: 'number',
      hidden: true,
      required: true,  // gửi API, không render UI
      skipRender: true,  // KHÔNG hiển thị UI
      skipSubmit: false, // ✅ gửi API
      
    },
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
