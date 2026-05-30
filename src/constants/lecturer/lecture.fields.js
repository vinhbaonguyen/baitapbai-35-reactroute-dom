export const LECTURE_FIELDS = [
    {
        name: 'lectureCode',
        label: 'Mã Giáo Viên',
        form: { type: 'text', hidden: false, disabled: true },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'contractType',
        label: 'Loại Hợp Đồng',
        form: { type: 'text', hidden: false, required: true },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'lectureName',
        label: 'Tên Giảng Viên',
        form: { type: 'text', hidden: false, required: true },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'gender',
        label: 'Giới tính',
        form: {
            defaultValue: 'Male',
            required: true,
            type: 'radio',
            options: ['Male', 'Female', 'Other']
        },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'dob',
        label: 'Ngày sinh',
        form: { required: false, type: 'date' },
        table: { type: 'date' },
        history: { type: 'date' }
    },
    {
        name: 'email',
        label: 'Email',
        form: { type: 'text', required: true },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'phone',
        label: 'Số điện thoại',
        form: { required: true, type: 'text' },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'address',
        label: 'Địa chỉ',
        form: { required: false, type: 'text' },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'specialty',
        label: 'Chuyên môn',
        form: { required: true, type: 'text' },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'experienceYears',
        label: 'Kinh nghiệm',
        form: { required: true, type: 'number' },
        table: { type: 'number' },
        history: { type: 'number' }

    },
    {
        name: 'degree',
        label: 'Bằng cấp',
        form: {
            type: 'picker',
            required: true,
            inputType: 'picker',
            pickerKey: 'degree'
        },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'skills',
        label: 'Kỹ năng',
        form: { defaultValue: [], required: true, type: 'array' },
        table: { type: 'array' },
        history: { type: 'array' }
    },
    {
        name: 'assignedClasses',
        label: 'Lớp phụ trách',
        form: {
            defaultValue: [],
            type: 'array',
            compare: false,        // ✅ không đưa vào compareData (Class page quản lý)
            skipSubmit: true,      // ✅ không gửi lên API khi save lecture
            inputType: 'picker',
            pickerKey: 'assignedClasses',
            placeholder: 'Các lớp đang dạy',
            disabled: true        // ✅ mặc định disable — chỉ hiển thị
        },
        table: { type: 'array' },
        history: { type: 'array' }
    },
    {
        name: 'salaryType',
        label: 'Loại lương',
        form: { required: true, type: 'text' },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'hourRate',
        label: 'Đơn giá/giờ',
        form: { required: false, type: 'number' },
        table: { type: 'number' },
        history: { type: 'number' }
    },
    {
        name: 'totalHours',
        label: 'Tổng giờ',
        form: { required: false, type: 'number' },
        table: { type: 'number' },
        history: { type: 'number' }
    },
    {
        name: 'monthSalary',
        label: 'Lương tháng',
        form: { required: false, type: 'number' },
        table: { type: 'number' },
        history: { type: 'number' }
    },
    {
        name: 'status',
        label: 'Trạng thái',
        form: {
            // defaultValue: 'Active',
            // type: 'select',
            // options: ['Active', 'Probation', 'Pending', 'Inactive', 'Suspended', 'Finished']
            required: true,
            type: 'text'
        },
        table: { type: 'status' },
        history: { type: 'status' }
    },
    {
        name: 'updatedAt',
        label: 'Sửa đổi ngày',
        form: { type: 'date', compare: false },
        table: { type: 'date' },
        history: { type: 'date' }
    }
]