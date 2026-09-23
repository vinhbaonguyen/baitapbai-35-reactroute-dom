// ─── 1. KẾT QUẢ CUỐI KHÓA ─────────────────────────────────────────────
export const SCORE_RESULT_OPTIONS = [
    { value: 'Pass', label: 'Đạt', color: 'green', icon: '✅' },
    { value: 'Fail', label: 'Không đạt', color: 'red', icon: '❌' },
    { value: 'Pending', label: 'Chờ điểm lần 2', color: 'orange', icon: '⏳' }
];

// ─── 2. TRẠNG THÁI CHỨNG CHỈ ─────────────────────────────────────────
export const CERTIFICATE_OPTIONS = [
    { value: true, label: 'Đã cấp', color: 'active', icon: '✅' },
    { value: false, label: 'Chưa cấp', color: 'suspended', icon: '⏳' }
];

// ─── 3. Score Field  ─────────────────────────────────────────────────

export const SCORE_FIELDS = [
    {
        name: 'studentId',
        label: 'Mã Học Viên',
        form: {
            type: 'picker',
            required: true,
            inputType: 'picker',
            pickerKey: 'studentPicker',
            placeholder: 'Chọn học viên',
            compare: true,
            skipSubmit: false,
            skipRender: true
        },
        table: { type: 'number', show: false },
        history: { type: 'number' },
        sort: { show: false }
    },
    {
        name: 'studentName',
        label: 'Tên Học Viên',
        form: {
            type: 'picker',
            required: true,
            inputType: 'picker',
            pickerKey: 'studentPicker',
            placeholder: 'Chọn học viên',
            compare: false,
            skipSubmit: true,
            skipRender: false
        },
        table: { type: 'text', show: true },
        history: { type: 'text' },
        sort: { show: true }
    },
    {
        name: 'classId',
        label: 'Lớp học',
        form: {
            type: 'picker',
            required: true,
            inputType: 'picker',
            pickerKey: 'classPicker',
            placeholder: 'Chọn lớp học',
            compare: true,
            skipSubmit: false,
            skipRender: true
        },
        table: { type: 'relation', relationKey: 'classCode', show: false },
        history: { type: 'text' },
        sort: { show: false }
    },
    {
        name: 'classCode',
        label: 'Lớp học',
        form: {
            type: 'picker',
            required: true,
            inputType: 'picker',
            pickerKey: 'classPicker',
            placeholder: 'Chọn lớp học',
            compare: false,
            skipSubmit: true,
            skipRender: false
        },
        table: { type: 'text', show: true },
        history: { type: 'text' },
        sort: { show: true }
    },
    {
        name: 'courseId',
        label: 'Khóa học',
        form: {
            readOnly: true,
            type: 'picker',
            placeholder: 'Khóa học sẽ hiển thị sau khi chọn Lớp Học',
            skipSubmit: true,            
            inputType: 'picker',
            // Do CourseId lấy từ BE 
            // pickerKey: 'coursePicker',
            // required: true,
           
        },
        table: { type: 'relation', relationKey: 'courseName', show: true },
        history: { type: 'text' },
        sort: { show: true }
    },
    {
        name: 'scoreAtFirstTime',
        label: 'Điểm lần 1',
        form: {
            type: 'number',
            required: true,
            min: 0,
            max: 100,
            placeholder: 'Nhập điểm lần 1'
        },
        table: { type: 'number', show: false },
        history: { type: 'number' },
        sort: { show: false }
    },
    {
        name: 'examDateFirstTime',
        label: 'Ngày thi lần 1',
        form: {
            type: 'date',
            required: true,
        },
        table: { type: 'date', show: false },
        history: { type: 'date' },
        sort: { show: false }
    },
    {
        name: 'scoreAtSecondTime',
        label: 'Điểm lần 2',
        form: {
            type: 'number',
            required: false,
            min: 0,
            max: 100,
            placeholder: 'Nhập điểm lần 2 (nếu có)'
        },
        table: { type: 'number', show: false },
        history: { type: 'number', show: true },
        sort: { show: false }
    },
    {
        name: 'examDateSecondTime',
        label: 'Ngày thi lần 2',
        form: {
            type: 'date',
            required: false,
        },
        table: { type: 'date', show: false },
        history: { type: 'date' },
        sort: { show: false }
    },
    {
        name: 'finalScore',
        label: 'Điểm Cao Nhất',
        form: {
            type: 'number',
            readOnly: true,
            placeholder: 'Tự động tính từ 2 lần thi'
        },
        table: { type: 'number', show: true },
        history: { type: 'number' },
        sort: { show: true }
    },
    {
        name: 'result',
        label: 'Kết quả',
        form: {
            type: 'text',
            readOnly: true,
            placeholder: 'tự động tính toán dựa trên dựa trên quy tắc : Pass/Fail'
        },
        table: { type: 'text', show: true },
        history: { type: 'text' },
        sort: { show: true }
    },
    {
        name: 'certificateIssued',
        label: 'Chứng chỉ',
        form: {
            type: 'checkbox',
            required: false,
            activeLabel: 'Đã Cấp',
            inactiveLabel: 'Chưa Cấp',
            defaultValue: false,
        },
        table: { type: 'boolean', show: true },
        history: { type: 'boolean' },
        sort: { show: true }
    },
    {
        name: 'note',
        label: 'Ghi chú',
        form: {
            type: 'textarea',
            required: false,
            placeholder: 'Nhập ghi chú'
        },
        table: { type: 'text', show: false },
        history: { type: 'text' },
        sort: { show: false }
    }
];

export const SCORE_SORT_OPTIONS = SCORE_FIELDS
    .filter(f => f.sort?.show)
    .map(f => ({
        value: f.name,
        label: f.label
    }));

export const SCORE_TABLE_COLUMNS = SCORE_FIELDS
    .filter(f => f.table?.show)
    .map(f => ({
        field: f.name,
        label: f.label,
        type: f.table?.type,
        relationKey: f.table?.relationKey
    }));

