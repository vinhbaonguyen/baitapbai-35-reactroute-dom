// export const LECTURE_FIELDS = [
//     {
//         name: 'lectureCode',
    //     label: 'Mã Giáo Viên',
    //     form: { type: 'text', hidden: false, disabled: true },
    //     table: { type: 'text' },
    //     history: { type: 'text' }
    // },
    // {
    //     name: 'contractType',
    //     label: 'Loại Hợp Đồng',
    //     form: { type: 'text', hidden: false, required: true },
    //     table: { type: 'text' },
    //     history: { type: 'text' }
    // },
    // {
    //     name: 'lectureName',
    //     label: 'Tên Giảng Viên',
    //     form: { type: 'text', hidden: false, required: true },
    //     table: { type: 'text' },
    //     history: { type: 'text' }
    // },
    // {
    //     name: 'gender',
    //     label: 'Giới tính',
    //     form: {
    //         defaultValue: 'Male',
    //         required: true,
    //         type: 'radio',
    //         options: ['Male', 'Female', 'Other']
    //     },
    //     table: { type: 'text' },
    //     history: { type: 'text' }
    // },
    // {
    //     name: 'dob',
    //     label: 'Ngày sinh',
    //     form: { required: false, type: 'date' },
    //     table: { type: 'date' },
    //     history: { type: 'date' }
    // },
    // {
    //     name: 'email',
    //     label: 'Email',
    //     form: { type: 'text', required: true },
    //     table: { type: 'text' },
    //     history: { type: 'text' }
    // },
    // {
    //     name: 'phone',
    //     label: 'Số điện thoại',
    //     form: { required: true, type: 'text' },
    //     table: { type: 'text' },
    //     history: { type: 'text' }
    // },
    // {
    //     name: 'address',
    //     label: 'Địa chỉ',
    //     form: { required: false, type: 'text' },
    //     table: { type: 'text' },
    //     history: { type: 'text' }
    // },
    // {
    //     name: 'specialtyName',  // name: 'category' → đổi thành specialtyName để thống nhất với backend,
    //     label: 'Chuyên môn',
    //     form: {
    //         required: true,           
    //         type: 'picker',
    //         inputType: 'picker',
    //         pickerKey: 'categoryPicker',
    //         disabled: false,
    //         placeholder: 'Chọn Chuyên môn',
    //         skipSubmit: true,  // ✅ chỉ hiển thị UI, KHÔNG gửi API
    //         compare: false      // ✅ KHÔNG đưa vào compareData (Course page quản lý)
    //     },
    //     table: { type: 'text' },
    //     history: { type: 'text' }
    // },
    // {
    //     name: 'specialtyId',  // thêm trường specialtyId để gửi API
    //     label: 'Lĩnh Vực ID',
    //     form: {
    //         type: 'number',
    //         hidden: true,
    //         required: true,  // gửi API, không render UI
    //         skipRender: true,  // KHÔNG hiển thị UI
    //         skipSubmit: false, // ✅ gửi API
    //     },
    //     history: { type: 'text' }
    // },
    // {
    //     name: 'experienceYears',
    //     label: 'Kinh nghiệm',
    //     form: { required: true, type: 'number' },
    //     table: { type: 'number' },
    //     history: { type: 'number' }
    // },
    // {
    //     name: 'degree',
    //     label: 'Bằng cấp',
    //     form: {
    //         type: 'picker',
    //         required: true,
    //         inputType: 'picker',
    //         pickerKey: 'degree'
    //     },
    //     table: { type: 'text' },
    //     history: { type: 'text' }
    // },
    // {
    //     name: 'skills',
    //     label: 'Kỹ năng',
    //     form: { defaultValue: [], required: true, type: 'array' },
    //     table: { type: 'array' },
    //     history: { type: 'array' }
    // },
   
    // {
    //     name: 'salaryType',
    //     label: 'Loại lương',
    //     form: { required: true, type: 'text', disabled: true },
    //     table: { type: 'text' },
    //     history: { type: 'text' }
    // },
    // {
    //     name: 'hourRate',
    //     label: 'Đơn giá/giờ',
    //     form: { required: false, type: 'number' },
    //     table: { type: 'number' },
    //     history: { type: 'number' }
    // },
    // {
    //     name: 'totalHours',
    //     label: 'Tổng giờ',
    //     form: { required: false, type: 'number' },
    //     table: { type: 'number' },
    //     history: { type: 'number' }
    // },
    // {
    //     name: 'monthSalary',
    //     label: 'Lương tháng',
    //     form: { required: false, type: 'number' },
    //     table: { type: 'number' },
//         history: { type: 'number' }
//     },
//     {
//         name: 'status',
//         label: 'Trạng thái',
//         form: {          
//             required: true,
//             type: 'text'
//         },
//         table: { type: 'status' },
//         history: { type: 'status' }
//     },
//     {
//         name: 'updatedAt',
//         label: 'Sửa đổi ngày',
//         form: { type: 'date', compare: false },
//         table: { type: 'date' },
//         history: { type: 'date' }
//     }
// ]