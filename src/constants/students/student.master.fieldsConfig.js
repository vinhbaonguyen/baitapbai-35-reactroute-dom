import { renderPaidSummaryCell } from "@/components/common/table/tableRender";

// 2. Tùy chọn Trạng thái (Dùng cho DataTable badge và StatusPicker)
export const STUDENT_STATUS_OPTIONS = [
    { value: 'Studying', label: 'Đang học', color: 'green', icon: '🟢' },
    { value: 'Dropped', label: 'Bỏ học giữa chừng', color: 'red', icon: '🔴' },
    { value: 'Pending', label: 'Chờ duyệt', color: 'orange', icon: '🟡' },
    { value: 'Suspended', label: 'Tạm đình chỉ', color: 'purple', icon: '🟣' },
    { value: 'Completed', label: 'Kết thúc', color: 'gray', icon: '⚪' }
];

export const STUDENTS_FIELDS = [
    {
        name: 'studentCode',
        label: 'Mã Sinh Viên',
        form: {
            required: false,
            type: 'text',
            placeholder: 'Sẽ được tạo tự động khi thêm mới Sinh Viên',
            hidden: false,
            disabled: false,
            readOnly: true,
            compare: false,
            skipSubmit: true,  // FE không gửi field này lên (BE tự set)
            skipRender: false
        },
        table: { type: 'text', show: true },
        history: { type: 'text', show: true },
        sort: { show: true }
    },
    {
        name: 'studentName',
        label: 'Tên Sinh Viên',
        form: {
            type: 'text',
            required: true,
            placeholder: 'Nhập Tên Sinh Viên',
            hidden: false,
            disabled: false,
            compare: true,
            skipSubmit: false,
            skipRender: false

        },
        table: { type: 'text', show: true },
        history: { type: 'text', show: true },
        sort: { show: true }
    },
    {
        name: 'dob',
        label: 'Ngày sinh',
        form: {
            type: 'date',
            required: false,
            placeholder: 'Chọn Ngày Sinh',
            hidden: false,
            disabled: false,
            compare: true,
            skipSubmit: false,
            skipRender: false

        },
        table: { type: 'date', show: false },
        history: { type: 'date', show: true },
        sort: { show: false }
    },
    {
        name: 'gender',
        label: 'Giới tính',
        form: {
            defaultValue: 'Male',
            required: true,
            type: 'radio',
            options: ['Male', 'Female', 'Other'],
            compare: true,
            skipSubmit: false,
            skipRender: false
        },
        table: { type: 'text', show: false },
        history: { type: 'text', show: true },
        sort: { show: false }
    },
    {
        name: 'email',
        label: 'Email',
        form: {
            type: 'text',
            required: true,
            placeholder: 'Nhập Email',
            hidden: false,
            disabled: false,
            compare: true,
            skipSubmit: false,
            skipRender: false
        },
        table: { type: 'text', show: false },
        history: { type: 'text', show: true },
        sort: { show: false }
    },
    {
        name: 'phone',
        label: 'Số điện thoại',
        form: {
            required: true,
            type: 'text',
            placeholder: 'Nhập Số điện thoại',
            hidden: false,
            disabled: false,
            compare: true,
            skipSubmit: false,
            skipRender: false
        },
        table: { type: 'text', show: false },
        history: { type: 'text', show: true },
        sort: { show: false }
    },
    {
        name: 'address',
        label: 'Địa chỉ',
        form: {
            required: false,
            type: 'text',
            placeholder: 'Nhập Địa chỉ',
            hidden: false,
            disabled: false,
            compare: true,
            skipSubmit: false,
            skipRender: false
        },
        table: { type: 'text', show: false },
        history: { type: 'text', show: true },
        sort: { show: false }
    },
    {
        name: 'status',
        label: 'Trạng thái',
        form: {
            required: true,
            type: 'picker',
            inputType: 'picker',
            pickerKey: 'status',
            placeholder: 'Chọn Trạng thái',
            compare: true,
            skipSubmit: false,
            skipRender: false,
        },
        table: { type: 'status', show: true },
        history: { type: 'status', show: true },
        sort: { show: true }
    },
    {
        name: 'paidSummary',
        label: 'Học phí',
        form: { hidden: true },
        table: { type: 'text', show: true },
        history: { type: 'text', show: true },
        sort: { show: false }
    },
    {
        name: 'courseIds',
        label: 'Các Khóa học đăng ký',
        form: {
            required: true,
            type: 'picker',
            inputType: 'picker',
            pickerKey: 'coursePicker',
            placeholder: 'Chọn Khóa học',
            compare: true,
            skipSubmit: false,
            skipRender: false
        },
        table: { hidden: true, show: false },
        history: { type: 'text', show: false },
        sort: { show: false }
    },
    {
        name: 'courseNames',
        label: 'Tên khóa học đăng ký',
        form: {
            type: 'text',
            compare: false,
            hidden: false,
            skipSubmit: true,
            skipRender: true
        },
        table: { type: 'text', show: true },
        history: { hidden: true, show: true },
        sort: { show: false }
    },
    {
        name: 'courseUd',
        label: 'Khóa học (ID)',
        form: { hidden: true , skipSubmit: true},
        table: { hidden: true, show: false },
        history: { type: 'text', show: true },
        sort: { show: false }

    },
    {
        name: 'courseName',
        label: 'Tên khóa học',
        form: { hidden: true,show: false },
        table: { hidden: true,show: false },
        history: { type: 'text' },
        sort: { show: false }
    }
]

export const STUDENT_TABLE_COLUMNS =
    STUDENTS_FIELDS
        .filter(f => f.table?.show)
        .map(f => ({
            field: f.name,
            label: f.label,
            type: f.table?.type || 'text',
            render: f.name === 'paidSummary'
                ? renderPaidSummaryCell
                : f.table?.render || null
        }));

export const STUDENT_SORT_OPTIONS =
    STUDENTS_FIELDS
        .filter(f => f.sort?.show)
        .map(f => ({
            value: f.name,
            label: f.label,
        }));