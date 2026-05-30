//config fields của form — phần khác nhau giữa các trang
export const USER_FIELDS = [
  {
    name: 'fullName',
    label: 'Họ và Tên',   
    form: { required: true, type: 'text' },
    table: { type: 'text' },
    history: { type: 'text' }
  },
  {
    name: 'userName',
    label: 'Tên Đăng Nhập',   
    form: { required: true, type: 'text' },
    table: { type: 'text' },
    history: { type: 'text' }
  },
  {
    name: 'email',
    label: 'Email',   
    form: { required: true, type: 'text' },
    table: { type: 'text' },
    history: { type: 'text' }
  },
  {
    name: 'status',
    label: 'Trạng Thái',    
    form: {
      required: true,
      type: 'select',
      options: ['Active', 'Inactive'],
      defaultValue: 'Active',
    },
    table: { type: 'status' },
    history: { type: 'text' }
  },
  {
    name: 'password',
    label: 'Mật Khẩu',   
    form: {
      type: 'password',
      required: false,
      validate: false,
      hidden:true 
    },
    table: { type: 'text' },
    history: { type: 'text' }
  },
  {
    name: 'role',
    label: 'Vai Trò',   
    form: {
      required: true,
      type: 'select',
      options: ['USER', 'ADMIN', 'MANAGER'],
      defaultValue: 'USER',
    },
    table: { type: 'badge' },
    history: { type: 'text' }

  },
  {
    name: 'createdAt',
    label: 'Ngày Tham Gia',    
    form: {
      hidden: true,
      type: 'date',
      compare: false
    },
    table: { type: 'date' },
    history: { type: 'date' }
  },
  {
    name: 'updatedAt',
    label: 'Ngày Sửa Đổi',   
    form: {
      hidden: true,
      type: 'date',
      compare: false
    },
    table: { type: 'date' },
    history: { type: 'date' }
  },
]