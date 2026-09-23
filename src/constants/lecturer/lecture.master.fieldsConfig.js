export const LECTURE_FIELDS = [
    {
        name: 'lectureCode',
        label: 'Mã Giáo Viên',
        form: {
            type: 'text',
            required: false,
            disabled: true,
            hidden: false,
            skipSubmit: true,  // ✅ chỉ hiển thị UI, KHÔNG gửi API
            skipRender: false,  // ✅ hiển thị trong form (chỉ hiển thị trong table & history)
        },
        table: { type: 'text',show: true },
        sort: { show: true },
        history: { type: 'text' }
    },
    {
        name: 'contractType',
        label: 'Loại Hợp Đồng',
        form: {
            // type: 'select',
            type: 'picker',
            pickerKey: 'contract',
            placeholder: 'Chọn Loại Hợp Đồng',
            required: true,
            options: [
                { value: 'HD', label: 'Hợp Đồng (HD)', salaryType: 'hourly', icon: '📄', desc: 'Lương theo giờ'},
                { value: 'CT', label: 'Chính Thức (CT)', salaryType: 'monthly', icon: '🏢', desc: 'Lương theo tháng' },
                { value: 'NR', label: 'Ngoài ra (NR)', salaryType: 'other',icon: '🤝', desc: 'Thỏa thuận' },
            ]
        },
        table: { type: 'text', show: false },
        sort: { show: false },
        history: { type: 'text' }
    },
    {
        name: 'lectureName',
        label: 'Tên Giáo Viên',
        form: {
            type: 'text',
            required: true,
            hidden: false,
            placeholder: 'Nhập Tên Giáo Viên',
        },
        table: { type: 'text', show: true },
        sort: { show: true },
        history: { type: 'text' }
    },
    {
        name: 'gender',
        label: 'Giới tính',
        form: {
            type: 'radio',
            required: true,
            defaultValue: 'Male',
            options: ['Male', 'Female', 'Other']
        },
        table: { type: 'text', show: false },
        sort: { show: false },
        history: { type: 'text' }
    },
    {
        name: 'dob',
        label: 'Ngày sinh',
        form: {
            type: 'date',
            required: false,
            placeholder: 'Chọn Ngày Sinh',
        },
        table: { type: 'date', show: false },
        sort: { show: false },
        history: { type: 'date' }

    },
    {
        name: 'email',
        label: 'Email',
        form: {
            type: 'text',
            required: true,
            placeholder: 'Nhập Email',
        },
        table: { type: 'text', show: false },
        sort: { show: false },
        history: { type: 'text' }

    },
    {
        name: 'phone',
        label: 'Số điện thoại',
        form: {
            type: 'text',
            required: true,
            placeholder: 'Nhập Số Điện Thoại',
        },
        table: { type: 'text', show: false },
        sort: { show: false },
        history: { type: 'text' }
    },
    {
        name: 'address',
        label: 'Địa chỉ',
        form: {
            type: 'text',
            required: false,
            placeholder: 'Nhập Địa Chỉ',
        },
        table: { type: 'text', show: false },
        sort: { show: false },
        history: { type: 'text' }
    },
    {
        name: 'specialtyName',  // name: 'category' → đổi thành specialtyName để thống nhất với backend,
        label: 'Chuyên môn',
        form: {
            type: 'picker',
            required: true,
            inputType: 'picker',
            pickerKey: 'categoryPicker',
            disabled: false,
            placeholder: 'Chọn Chuyên môn',
            skipSubmit: true,  // ✅ chỉ hiển thị UI, KHÔNG gửi API
            compare: false,  // ✅ không so sánh giá trị cũ mới khi submit (vì chỉ hiển thị UI)           
        },
        table: { type: 'text', show: true },
        sort: { show: true }
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
        table: { show: false },
        history: { type: 'text' },
        sort: { show: false }
    },
    {
        name: 'experienceYears',
        label: 'Kinh nghiệm',
        form: {
            required: true,
            type: 'number',
            placeholder: 'Nhập số năm kinh nghiệm',
        },
        table: {
            type: 'number',
            show: true,
            render: row => `${row.experienceYears} năm`
        },
        sort: { show: false },
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
        table: { type: 'text', show: true },
        sort: { show: false },
        history: { type: 'text' }
    },
    {
        name: 'skills',
        label: 'Kỹ năng',
        form: {
            type: 'picker',
            required: true,
            inputType: 'picker',
            pickerKey: 'skills',
            placeholder: 'Chọn Kỹ năng',
        },
        table: { type: 'array', show: false },
        sort: { show: false },
        history: { type: 'array' }
    },
    {
        name: 'salaryType',
        label: 'Loại Lương',
        form: {
            type: 'text',
            disabled: true,
            required: true,
        },
        table: { type: 'text', show: false },
        sort: { show: false },
        history: { type: 'text' }

    },
    {
        name: 'hourRate',
        label: 'Đơn giá/giờ',
        form: {
            type: 'number',
            required: false,
            placeholder: 'Nhập Đơn giá/giờ',
        },
        table: { type: 'number', show: false },
        sort: { show: false },
        history: { type: 'number' }

    },
    {
        name: 'totalHours',
        label: 'Tổng giờ dạy',
        form: {
            type: 'number',
            required: false,
            placeholder: 'Nhập Tổng giờ dạy',
        },
        table: { type: 'number', show: false },
        sort: { show: false },
        history: { type: 'number' }
    },
    {
        name: 'monthSalary',
        label: 'Lương tháng',
        form: {
            type: 'number',
            required: false,
            placeholder: 'Nhập Lương Tháng',
        },
        table: { type: 'number', show: false },
        sort: { show: false },
        history: { type: 'number' }
    },
    {
        name: 'status',
        label: 'Trạng thái',
        form: {
            type: 'picker',
            required: true,
            inputType: 'picker',
            pickerKey: 'status'
        },
        table: { type: 'status', show: true },
        sort: { show: true },
        history: { type: 'status' }
    },
];
export const LECTURE_TABLE_COLUMNS =
    LECTURE_FIELDS
        .filter(f => f.table?.show)
        .map(f => ({
            field: f.name,
            label: f.label,
            type: f.table?.type || 'text',
            render: f.table?.render || null
        }));

export const SORT_OPTION = 
        LECTURE_FIELDS
        .filter(f => f.sort?.show )
        .map(f => ({
            value: f.name,
            label: f.label
        }));

export const CONTRACT_TYPES = 
        LECTURE_FIELDS.find(f => f.name === 'contractType').form.options;

// Dùng ở useLectureForm.jsx
export const CONTRACT_SALARY = CONTRACT_TYPES.reduce((accu, contactType) => {
    accu[contactType.value] = contactType.salaryType
    return accu;
}, {})
// Dùng ở LectureModal.jsx
export const CONTRACT_DESCRIPTION = CONTRACT_TYPES.reduce((accu, contractType) => {
    accu[contractType.value] = contractType.icon + contractType.label
    return accu;
}, {})

//6. Tùy chọn Bằng Cấp (Dùng cho DataTable badge và StatusPicker)
export const LECTURE_DEGREE_OPTIONS = [
    { value: 'Bachelor', label: 'Cử Nhân', color: 'green', icon: '🟢' },
    { value: 'Master', label: 'Thạc sỹ', color: 'blue', icon: '🔵' },
    { value: 'PhD', label: 'Tiến Sỹ', color: 'orange', icon: '🟡' },
    { value: 'Associate', label: 'Cao Đẳng', color: 'red', icon: '🔴' },
];

//2. Tùy chọn Trạng thái (Dùng cho DataTable badge và StatusPicker)
export const LECTURE_STATUS_OPTIONS = [
    { value: 'Active', label: 'Đang làm việc', color: 'green', icon: '🟢' },
    { value: 'Probation', label: 'Thử việc', color: 'blue', icon: '🔵' },
    { value: 'Pending', label: 'Chờ duyệt', color: 'orange', icon: '🟡' },
    { value: 'Inactive', label: 'Đã nghỉ việc', color: 'red', icon: '🔴' },
    { value: 'Suspended', label: 'Tạm đình chỉ', color: 'purple', icon: '🟣' },
    { value: 'Finished', label: 'Kết thúc', color: 'gray', icon: '⚪' }
];

// dùng trong SkillPickerModal
export const PRESET_SKILLS = [
    'Java', 'Spring Boot', 'MySQL', 'PostgreSQL', 'MongoDB',
    'JavaScript', 'TypeScript', 'ReactJS', 'NodeJS', 'VueJS',
    'Python', 'Django', 'PHP', 'Laravel',
    'C#', '.NET', 'HTML', 'CSS', 'Docker', 'Git',
]