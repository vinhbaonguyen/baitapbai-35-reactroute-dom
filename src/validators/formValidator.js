/**
 * @param {Object} form - Dữ liệu hiện tại của form
 * @param {Array} fields - Cấu hình các fields từ Constants
 * @param {String} fieldName - Tên field cụ thể (nếu validate lẻ)
 * @param {Object} editItem - Dữ liệu gốc khi sửa (nếu có)
 */

export const validateForm = (form, fields, fieldName = null, editItem = null) => {
    // 1. Validate lẻ 1 field (dùng cho onBlur/onChange)
    if (fieldName) {
        const field = fields.find(f => f.name === fieldName);
        if (!field) return null;
        return getErrorMessage(field, form[fieldName], form, editItem);
    }

    // 2. Validate toàn bộ form (dùng cho onSubmit)
    const errors = {};
    fields.forEach(field => {
        const error = getErrorMessage(field, form[field.name], form, editItem);
        if (error) {
            errors[field.name] = error; // Lưu lỗi theo key là tên field
        }
    });
    // console.log(errors);

    // Trả về Object các lỗi, hoặc null nếu tất cả đều hợp lệ
    return Object.keys(errors).length > 0 ? errors : null;
};

const getErrorMessage = (field, value, form, editItem) => {
    const val = String(value ?? '').trim();    
    //Áp dụng cho LectureModal Khi chọn loại hợp đồng ⇒ tránh errors không cần thiết
    // Nếu là Hợp đồng (CT) -> KHÔNG validate Lương giờ và Tổng Giờ làm việc (nếu bạn có trường này)
    if (form.contractType === 'CT') {
        if (field.name === 'hourRate' || field.name === 'totalHours') return null;
    }
    // Nếu là Hợp đồng (HD) hoặc Ngoài ra (NR) -> KHÔNG validate Lương tháng (nếu bạn có trường này)
    if (form.contractType === 'HD' || form.contractType === 'NR') {
        if (field.name === 'monthSalary') return null;
    }
    // Bỏ qua validate các trường hợp hidden ( createdAt hay updatedAt ...)
    if(field.form?.hidden) return null;
    // Nếu field bị disabled VÀ đang trong chế độ Edit (editItem có dữ liệu) 
    // -> Bỏ qua không validate field này.
    if (field.form?.disabled && !!editItem) return null;

    // 1.Kiểm tra rỗng (Mặc định tất cả là required, trừ khi cấu hình required: false)
    if (field.form?.required && val === '' && field.form?.type !== 'select') return `Vui lòng nhập ${field.label}`;

    // 2. Logic theo tên Field (Dùng chung cho toàn hệ thống)
    if (field.name === 'email' && val !== '') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Email không đúng định dạng';
    }

    // Kiểm tra độ dài mật khẩu
    if (field.form?.validate === 'password' && val !== '') {
        // Khi Edit, nếu mật khẩu để trống có thể hiểu là không đổi, 
        // nhưng ở đây ta check theo độ dài nếu có nhập.
        if (val.length < 6) return 'Mật khẩu tối thiểu 6 ký tự';
    }

    // Kiểm tra xác nhận mật khẩu
    if (field.form?.validate === 'confirm' && val !== form.password) {
        return 'Mật khẩu xác nhận không khớp';
    }
    // 3. Logic theo Type (Ví dụ: number)
    if (field.form?.type === 'number' && field.min !== undefined) {
        if (Number(val) < field.min) return `${field.label} không được nhỏ hơn ${field.min}`
    }
    return null;
};