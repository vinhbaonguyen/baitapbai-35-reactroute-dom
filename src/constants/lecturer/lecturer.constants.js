// ─── 1. THÔNG TIN HỢP ĐỒNG & LƯƠNG ───
//1.1 dùng ở Sub-modal ContractPickerModal
export const CONTRACT_TYPES = [
    {
        value: 'HD',
        label: 'Hợp Đồng',
        desc: 'Lương theo giờ',
        icon: '📄',
        salaryType: 'hourly'
    },
    {
        value: 'CT',
        label: 'Chính Thức',
        desc: 'Lương theo tháng',
        icon: '🏢',
        salaryType: 'monthly'
    },
    {
        value: 'NR',
        label: 'Ngoài ra',
        desc: 'Thỏa thuận',
        icon: '🤝',
        salaryType: 'other'
    }
]
// Nếu các chỗ cũ vẫn cần object key-value để tra cứu nhanh, 
// ta dùng hàm reduce để tạo ra từ mảng trên (tự động cập nhật)
//1.2 Dùng trong hook useLectureForm
// export const CONTRACT_SALARY = {
//     HD: 'hourly',
//     CT: 'monthly',
//     NR: 'other'
// }
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
//===============================================
// dùng trong SkillPickerModal
export const PRESET_SKILLS = [
    'Java', 'Spring Boot', 'MySQL', 'PostgreSQL', 'MongoDB',
    'JavaScript', 'TypeScript', 'ReactJS', 'NodeJS', 'VueJS',
    'Python', 'Django', 'PHP', 'Laravel',
    'C#', '.NET', 'HTML', 'CSS', 'Docker', 'Git',
]
//==============================================


//2. Tùy chọn Trạng thái (Dùng cho DataTable badge và StatusPicker)
export const LECTURE_STATUS_OPTIONS = [
    { value: 'Active', label: 'Đang làm việc', color: 'green', icon: '🟢' },
    { value: 'Probation', label: 'Thử việc', color: 'blue', icon: '🔵' },
    { value: 'Pending', label: 'Chờ duyệt', color: 'orange', icon: '🟡' },
    { value: 'Inactive', label: 'Đã nghỉ việc', color: 'red', icon: '🔴' },
    { value: 'Suspended', label: 'Tạm đình chỉ', color: 'purple', icon: '🟣' },
    { value: 'Finished', label: 'Kết thúc', color: 'gray', icon: '⚪' }
];
// ─── 4. CẤU HÌNH HIỂN THỊ (DataTable & Toolbar) ───
//4.1 Cấu hình cho ô Select Sort ở Page Lecture
export const SORT_OPTION = [
    { value: 'lectureCode', label: 'Theo Mã Giáo Viên' },
    { value: 'lectureName', label: 'Theo Tên Giáo Viên' },
    { value: 'specialty', label: 'Theo Chuyên Môn' },
    { value: 'experienceYears', label: 'Theo Số Năm kinh nghiệm' },
    { value: 'status', label: 'Theo Trạng Thái' }
]
// 4.2 Cấu hình cho Data Table ở Page Lecture
export const LECTURE_TABLE_COLUMNS = [
    { field: 'lectureCode', label: 'Mã Giáo Viên' },
    { field: 'lectureName', label: 'Tên Giáo Viên' },
    { field: 'specialty', label: 'Chuyên Môn ' },
    {
        field: 'experienceYears',
        label: 'Kinh Nghiệm',
        render: row => row.experienceYears ? `${row.experienceYears} năm` : '-'
    },
    { field: 'status', label: 'Trạng Thái' },
]

// ─── 5. ĐỊNH NGHĨA CÁC FIELDS TRONG Lecture MODAL 
// dùng ở SpacialtyPickerModal
export const SPECIALTY_LIST = [
    'Frontend Developer', 'Backend Developer', 'Fullstack Developer',
    'Data Scientist', 'UI/UX Designer', 'Mobile App Developer' , 'Database & API'
];

//6. Tùy chọn Bằng Cấp (Dùng cho DataTable badge và StatusPicker)
export const LECTURE_DEGREE_OPTIONS = [
    { value: 'Bachelor', label: 'Cử Nhân', color: 'green', icon: '🟢' },
    { value: 'Master', label: 'Thạc sỹ', color: 'blue', icon: '🔵' },
    { value: 'Doctorate-PhD', label: 'Tiến Sỹ', color: 'orange', icon: '🟡' },
    { value: 'Associate', label: 'Cao Đẳng', color: 'red', icon: '🔴' },
];
