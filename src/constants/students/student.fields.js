export const STUDENTS_FIELDS = [
    {
        name: 'studentCode',
        label: 'Mã Sinh Viên',
        form: { hidden: false, disabled: true, type: 'text' },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'studentName',
        label: 'Tên Sinh Viên',
        form: { hidden: false, disabled: false, required: true },
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
        name: 'gender',
        label: 'Giới tính',
        form: {
            defaultValue: 'Male',
            required: true,
            type: 'radio',
            options: ['Male', 'Female', 'Others']
        },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'email',
        label: 'Email',
        form: { required: true },
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
        name: 'status',
        label: 'Trạng thái',
        form: {
            // defaultValue: 'Pending',
            // required: true,
            // type: 'select',
            // options: ['Studying', 'Completed', 'Dropped', 'Suspended', 'Pending']
            required: true,
            type: 'text',
            skipRender: false,
            inputType: 'picker',
            pickerKey: 'status',
            placeholder: 'Chọn Trạng thái'

        },
        table: { type: 'status' },
        history: { type: 'status' }
    }, 
    {
        field: 'paidSummary',
        label: 'Học phí',
        form: { hidden: true },
        table: { type: 'text' },
        history: { type: 'text' }
    }
    ,

    {
        name: 'courseIds',
        label: 'Khóa học đăng ký',
        form: {
            required: true,
            type: 'text',
            inputType: 'picker',
            pickerKey: 'coursePicker',
            placeholder: 'Chọn Khóa học'
        },
        table: { hidden: true },
        history: { type: 'text' }
    },
    {
        name: 'courseNames',
        label: 'Tên khóa học đăng ký',
        form: {
            compare: false,
            hidden: true
        },
        table: { type: 'text' },
        history: { hidden: true }
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
        label: 'Sửa đổi ngày',
        form: { type: 'date', compare: false, hidden: true },
        table: { type: 'date' },
        history: { type: 'date' }
    },
    {
        name: 'courseUd',
        label: 'Khóa học (ID)',
        form: { hidden: true },
        table: { hidden: true },
        history: { type: 'text' }
    },
    {
        name: 'courseName',
        label: 'Tên khóa học',
        form: { hidden: true },
        table: { hidden: true },
        history: { type: 'text' }
    }

]