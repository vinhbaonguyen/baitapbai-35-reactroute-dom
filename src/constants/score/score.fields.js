export const SCORE_FIELDS = [
    {
        name: 'studentId',
        label: 'Mã Học Viên',
        form: {
            type: 'picker',
            required: true,
            inputType: 'picker',
            pickerKey: 'studentPicker',
            placeholder: 'Chọn học viên'
        },
        table: { type: 'relation', relationKey: 'studentName' },
        history: { type: 'text' }
    },
    {
        name: 'classId',
        label: 'Lớp học',
        form: {
            type: 'picker',
            required: true,
            inputType: 'picker',
            pickerKey: 'classPicker',
            placeholder: 'Chọn lớp học'
        },
        table: { type: 'relation', relationKey: 'classCode' },
        history: { type: 'text' }
    },
    {
        name: 'courseId',
        label: 'Khóa học',
        form: {
            readOnly:true,
            type: 'picker',
            // required: true,
            inputType: 'picker',
            // pickerKey: 'coursePicker',
            placeholder: 'Khóa học sẽ hiển thị sau khi chọn Lớp Học'
        },
        table: { type: 'relation', relationKey: 'courseName' },
        history: { type: 'text' }
    },
    {
        name: 'scoreAtFirstTime',
        label: 'Điểm lần 1',
        form: {
            type: 'number',
            required: true,
            min: 0,
            max: 10,
            placeholder: 'Nhập điểm lần 1'
        },
        table: { type: 'number' },
        history: { type: 'number' }

    },
    {
        name: 'examDateFirstTime',
        label: 'Ngày thi lần 1',
        form: {
            type: 'date',
            required: true,
        },
        table: { type: 'date' },
        history: { type: 'date' }
    },
    {
        name: 'scoreAtSecondTime',
        label: 'Điểm lần 2',
        form: {
            type: 'number',
            required: false,
            min: 0,
            max: 10,
            placeholder: 'Nhập điểm lần 2 (nếu có)'
        },
        table: { type: 'number' },
        history: { type: 'number' }

    },
    {
        name: 'examDateSecondTime',
        label: 'Ngày thi lần 2',
        form: {
            type: 'date',
            required: false,
        },
        table: { type: 'date' },
        history: { type: 'date' }
    },
    {
        name: 'finalScore',
        label: 'Điểm Cao Nhất',
        form: {
            type: 'number',
            readOnly: true,            
            placeholder: 'Tự động tính từ 2 lần thi'
        },
        table: { type: 'number' },
        history: { type: 'number' }
    },
    
    {
        name: 'result',
        label: 'Kết quả',
        form: {
            type: 'text',
            readOnly: true,
            placeholder: 'tự động tính toán dựa trên dựa trên quy tắc : Pass/Fail'
        },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'certificateIssued',
        label: 'Chứng chỉ',
        form: {
            type: 'checkbox',
            required: false,
            activeLabel:'Đã Cấp',
            inactiveLabel:'Chưa Cấp',
            defaultValue: false,
        },
        table: { type: 'boolean' },
        history: { type: 'boolean' }
    },
    {
        name: 'note',
        label: 'Ghi chú',
        form: {
            type: 'textarea',
            required: false,
            placeholder: 'Nhập ghi chú'
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
        label: 'Sửa đổi ngày',
        form: { type: 'date', compare: false, hidden: true },
        table: { type: 'date' },
        history: { type: 'date' }
    },
]