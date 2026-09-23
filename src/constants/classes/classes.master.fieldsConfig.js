export const CLASSES_STATUS_OPTIONS = [
    { value: 'Planned', label: 'Lớp Dự Kiến Mở', color: 'green', icon: '🟢' },
    { value: 'Active', label: 'Lớp Đang Học', color: 'blue', icon: '🔵' },
    { value: 'Paused', label: 'Lớp Tạm Dừng', color: 'orange', icon: '🟡' },
    { value: 'Completed', label: 'Lớp đã kết thúc', color: 'red', icon: '🔴' },
    { value: 'Cancelled', label: 'Lớp bị hủy', color: 'purple', icon: '🟣' },
    { value: 'Archived', label: 'Lớp Lưu Trữ', color: 'gray', icon: '⚪' }
];

export const BRAND_NAME = [
    { value: 'HN', label: 'Hà Nội' },
    { value: 'ĐN', label: 'Đà Nẵng' },
    { value: 'HCM', label: 'Hồ Chí Minh' },
]
export const CLASSES_FIELDS = [
    {
        name: 'classCode',
        label: 'Mã Số Lớp',
        form: {
            required: false,     // ✅ đổi từ true -> false
            type: 'text',
            placeholder: 'Sẽ được tạo khi chọn Khóa học và Chi Nhánh',
            disabled: true,
            readOnly: true,
            compare: false,
            skipSubmit: true,  // ✅ đổi từ false -> true (BE không nhận field này)
            skipRender: false
        },
        table: { type: 'text', show: true },
        history: { type: 'text', show: true },
        sort: { show: true }
    },
    {
        name: 'lectureId',
        label: 'Giáo Viên',
        form: {
            required: true,
            // type: 'text',
            type: 'picker',
            inputType: 'picker',
            pickerKey: 'lecturePicker',
            placeholder: 'Chọn giáo viên',
            compare: true,
            skipSubmit: false,
            skipRender: false
        },
        table: { type: 'relation', relationKey: 'lectureName', show: true },
        history: { type: 'text', show: true },
        sort: { show: false }
    },
    // {
    //     name: 'specialtyId',  // Đổi description thành specialtyId 
    //     label: 'Chuyên Ngành',         // Đổi Mô tả thành Chuyên Ngành 
    //     form: {
    //         required: false,
    //         type: 'text',
    //         disabled: true,         // vẫn readonly, tự động
    //         placeholder: 'Tự động lấy từ chuyên ngành của Khóa học',
    //         compare: false,
    //         skipSubmit: true,       // FE không gửi field này lên (BE tự set)
    //         skipRender: true
    //     },
    //     table: { type: 'relation', relationKey: 'specialtyName', show: true },
    //     history: { type: 'text', show: true },
    //     sort: { show: false }
    // },
    {
        name: 'specialtyName',  // Đổi description thành specialtyId 
        label: 'Tên Chuyên Ngành',         // Đổi Mô tả thành Chuyên Ngành 
        form: {
            required: false,
            type: 'text',
            disabled: true,         // vẫn readonly, tự động
            placeholder: 'Tự động lấy từ chuyên ngành của Khóa học',
            compare: false,
            skipSubmit: true,       // FE không gửi field này lên (BE tự set)
            skipRender: false
        },
        table: { type: 'text', show: true },
        history: { type: 'text', show: true },
        sort: { show: false }

    },
    {
        name: 'classNumber',
        label: 'Sĩ Số Sinh Viên',
        form: {
            type: 'number',
            required: false,
            disabled: true,
            placeholder: 'Tự động tạo khi bạn chọn student List',
            compare: true,
            skipSubmit: true,   // 🔥 BE luôn tự tính lại — FE không được phép ghi đè giá trị thật
            skipRender: false
        },
        table: { type: 'number', show: true },
        history: { type: 'number', show: true },
        sort: { show: true }
    },
    {
        name: 'status',
        label: 'Trạng thái',
        form: {
            required: true,
            type: 'picker',
            inputType: 'picker',
            pickerKey: 'status',
            placeholder: 'Chọn trạng thái',
            compare: true,
            skipSubmit: false,
            skipRender: false
        },
        table: { type: 'status', show: true },
        history: { type: 'status', show: true },
        sort: { show: true }
    },
    {
        name: 'courseId',
        label: 'Khóa học',
        form: {
            type: 'picker',
            readOnly: false,
            required: true,
            inputType: 'picker',
            pickerKey: 'coursePicker',
            placeholder: 'Chọn khóa học',
            compare: true,
            skipSubmit: false,
            skipRender: false
        },
        table: { type: 'relation', relationKey: 'courseName', show: true },
        history: { type: 'number', show: true },
        sort: { show: true }
    },
    {
        name: 'brand',         // ✅ đổi từ 'branch' -> 'brand'
        label: 'Chi nhánh',
        form: {
            type: 'picker',
            required: true,
            inputType: 'picker',
            pickerKey: 'branchPicker',
            placeholder: 'Chọn chi nhánh',
            compare: true,
            skipSubmit: false, // ❗ KHÔNG đưa vào getSubmitData() 
            skipRender: false
        },
        table: { hidden: true, show: false },
        history: { hidden: true, show: false },
        sort: { show: false }
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
            disabled: true,                   // mặc định: chưa chọn courseId thì disable
            skipRender: false   // 🔥 tự render trong ClassModal.jsx — cần lọc Completed khỏi
                                 //    CẢ mảng id lẫn tên, FormRenderer generic không làm được việc này
        },
        // table: { type: 'text', hidden: false, show: true }, // chưa cần hiển thị ở bảng
        // table:{ type: 'relation', relationKey: 'studentNames', show: true }, // hiển thị tên học viên đã join
        table: { type: 'countModal', relationKey: 'studentList', show: true }, // hiển thị tên học viên đã join
        history: { hidden: false, type: 'text', show: true },
        sort: { show: false }
    }
]

export const CLASSES_SORT_OPTION = CLASSES_FIELDS
    .filter(f => f.sort?.show)
    .map(f => ({
        value: f.name,
        label: f.label,
    }));

export const CLASSES_TABLE_COLUMNS = CLASSES_FIELDS
    .filter(f => f.table?.show)
    .map(f => ({
        field: f.name,
        label: f.label,
        type: f.table?.type,
        relationKey: f.table?.relationKey
    }))
