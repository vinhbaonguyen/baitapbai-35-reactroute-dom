// ─── 1. KẾT QUẢ CUỐI KHÓA ─────────────────────────────────────────────
// export const SCORE_RESULT_OPTIONS = [
//     { value: 'Excellent', label: 'Xuất sắc', color: 'green', icon: '🌟' },
//     { value: 'Good', label: 'Tốt', color: 'blue', icon: '👍' },
//     { value: 'Pass', label: 'Đạt', color: 'orange', icon: '✔️' },
//     { value: 'Fail', label: 'Không đạt', color: 'red', icon: '❌' },
// ];
// export const SCORE_RESULT_OPTIONS = [
//     { value: 'Pass', label: 'Đạt', color: 'green', icon: '✅' },
//     { value: 'Fail', label: 'Không đạt', color: 'red', icon: '❌' },
//     { value: 'Pending', label: 'Chờ điểm lần 2', color: 'orange', icon: '⏳' }
// ];

// ─── 2. TRẠNG THÁI CHỨNG CHỈ ─────────────────────────────────────────
// export const CERTIFICATE_OPTIONS = [
//     { value: true, label: 'Đã cấp', color: 'active', icon: '✅' },
//     { value: false, label: 'Chưa cấp', color: 'suspended', icon: '⏳' }
// ];
// color được cấu hình trong PageComponent.scss element .badge 
// ─── 3. CẤU HÌNH CỘT CHO SCORE TABLE ────────────────────────────────
// export const SCORE_TABLE_COLUMNS = [
//     {
//         field: 'studentId',
//         label: 'Tên Học Viên',
//         type: 'relation',
//         relationKey: 'studentName'

//     },
//     {
//         field: 'classId',
//         label: 'Lớp học',
//         type: 'relation',
//         relationKey: 'classCode'
//     },
//     {
//         field: 'courseId',
//         label: 'Khóa học',
//         type: 'relation',
//         relationKey: 'courseName'
//     },
//     { field: 'finalScore', label: 'Điểm Cao nhất' },
//     {
//         field: 'result',
//         label: 'Kết quả',
//         render: (row) => {
//             const option = SCORE_RESULT_OPTIONS.find(opt => opt.value === row.result);
//             return option ? `${option.icon} ${option.label}` : '-';
//         }
//     },
//     {
//         field: 'certificateIssued',
//         label: 'Chứng chỉ',
//         type: 'boolean',
//         // render: row => row.certificateIssued ? 'Đã cấp' : 'Chưa cấp' 
//         //↑nếu có render ở trên thì hàm renderCell sẽ khg render type:'boolean' vì hàm render được ưu tiên 
//     } 
// ];

// ─── 4. SORT OPTIONS ────────────────────────────────────────────────
// export const SCORE_SORT_OPTIONS = [
//     { value: 'studentName', label: 'Theo Tên Học Viên' },
//     { value: 'classCode', label: 'Theo Lớp học' },
//     { value: 'courseName', label: 'Theo Khóa học' },
//     { value: 'finalScore', label: 'Theo Điểm Cuối Khóa' },
//     { value: 'certificateIssued', label: 'Chứng chỉ' },

// ];