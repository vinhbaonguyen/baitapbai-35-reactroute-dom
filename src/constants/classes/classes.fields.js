export const CLASSES_FIELDS = [
    {
        name: 'classCode',
        label: 'Mã Số Lớp',
        form: {
            required: true,
            type: 'text',
            placeholder: 'Sẽ được tạo khi chọn Khóa học và Chi Nhánh',
            disabled: true,
            readOnly: true
        },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'lectureId',
        label: 'Giáo Viên',
        form: {
            required: true,
            type: 'text',
            inputType: 'picker',
            pickerKey: 'lecturePicker',
            placeholder: 'Chọn giáo viên'
        },
        table: { type: 'relation', relationKey: 'lectureName' },
        history: { type: 'text' }
    },
    {
        name: 'description',
        label: 'Mô tả',
        form: {
            required: false,
            type: 'text',
            disabled: true,
            placeholder: 'Tự động tạo khi bạn chọn Course'
        },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'classNumber',
        label: 'Sĩ Số Sinh Viên',
        form: {
            type: 'number',
            required: false,
            disabled: true,
            placeholder: 'Tự động tạo khi bạn chọn student List'
        },
        table: { type: 'number' },
        history: { type: 'number' }
    },
    {
        name: 'status',
        label: 'Trạng thái',
        form: {
            required: true,
            inputType: 'picker',
            pickerKey: 'status',
            placeholder: 'Chọn trạng thái'
        },
        table: { type: 'status' },
        history: { type: 'status' }
    },
    {
        name: 'courseId',
        label: 'Khóa học',
        form: {
            required: true,
            inputType: 'picker',
            pickerKey: 'coursePicker',
            placeholder: 'Chọn khóa học',
        },
        table: { type: 'relation', relationKey: 'courseName' },
        history: { type: 'number' }

    },
    {
        name: 'branch',
        label: 'Chi nhánh',
        form: {
            required: true,
            inputType: 'picker',
            pickerKey: 'branchPicker',
            placeholder: 'Chọn chi nhánh',
            compare: true,
            skipSubmit: false, // ❗ KHÔNG đưa vào getSubmitData() 
            skipRender: false
        },
        table: { hidden: true },
        history: { hidden: true }
    },
    {
        name: 'studentList',
        label: 'Danh Sách Học viên',
        form: {
            type: 'array',        // ✅ compareData sẽ sort + so sánh đúng
            compare: true,        // ✅ được đưa vào vòng so sánh
            skipSubmit: true,     // ✅ KHÔNG gửi lên classes API (lưu riêng qua assignStudents)
            inputType: 'picker',
            pickerKey: 'studentListPicker',
            placeholder: 'Chọn Học Viên Sau Khi bạn chọn Course',   // 👈 dùng để bật modal
            disabled: true                       // mặc định: chưa chọn courseId thì disable
        },
        table: { type: 'text', hidden: true }, // chưa cần hiển thị ở bảng
        history: { hidden: false, type: 'text' }
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
]