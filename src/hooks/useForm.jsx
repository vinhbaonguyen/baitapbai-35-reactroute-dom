/**
 * Hook dùng chung cho mọi loại Form trong hệ thống
 * @param {Array} fields - Cấu hình fields từ constants
 * @param {Object} editItem - Dữ liệu khi sửa (nếu có)
 * @param {Object} dependencies - Các dữ liệu phụ thuộc (ví dụ: allLectures, allCourses)
 * @param {Function} onFieldsChange - Callback xử lý logic dây chuyền (tự tạo mã, tự gán lương...)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { validateForm } from './../validators/formValidator';

export default function useForm({ fields, editItem, dependencies = {}, onFieldsChange }) {
    const initForm = useCallback(() => {
        return fields.reduce((acc, field) => {
            const { name, form } = field;
            const { defaultValue, type, options } = form || {}

            let value = editItem ? editItem[name] : undefined;
            // ===== normalize theo type =====
            if (type === 'date' && value) {
                value = value.split('T')[0];
            }
            if (type === 'number') {
                value = value === '' || value === null || value === undefined
                    ? ''
                    : Number(value);
            }
            if (type === 'array') {
                value = Array.isArray(value) ? value : (defaultValue ?? []);
            }
            // ===== fallback =====
            if (value === '' || value === undefined || value === null) {
                value = defaultValue ?? '';
            }
            // ===== validate options ===== =====
            if (options && options.length > 0) {
                const isValid = options.includes(value);
                if (!isValid) {
                    value = defaultValue ?? options[0];
                }
            }
            acc[name] = value;
            return acc;
        }, {});
    }, [fields, editItem]);

    const [form, setForm] = useState(() => initForm());
    const [errors, setErrors] = useState({});
    //Hàm reset Form Khi không thay đổi nội dung Khi USER đã sửa nhưng khg muốn lưu và muốn quay lại
    const resetForm = useCallback(() => {
        setForm(initForm());
        setErrors({})
    }, [initForm])
    // formRef — đảm bảo getSubmitData luôn đọc form mới nhất
    const formRef = useRef(form);
    useEffect(() => { formRef.current = form }, [form])

    // 2. Hàm cập nhật giá trị thủ công (Dùng cho Picker hoặc logic tự động)
    const setFieldValue = useCallback((name, value) => {
        const field = fields.find(f => f.name === name);
        const type = field?.form?.type;

        let finalValue = value;

        if (type === 'number') {
            finalValue = value === '' ? '' : Number(value)
        }

        setForm(prev => {
            let nextForm = { ...prev, [name]: finalValue };
            // 👇 RESET LOGIC ĐẶT Ở ĐÂY
            if (name === 'salaryType') {
                nextForm = {
                    ...nextForm,
                    hourRate: '',
                    totalHours: '',
                    monthSalary: ''
                };
            }
            return onFieldsChange
                ? onFieldsChange(name, finalValue, nextForm, dependencies)
                : nextForm;
        });
        // Xóa lỗi khi có dữ liệu mới
        setErrors(prev => ({ ...prev, [name]: null }));
    }, [fields, onFieldsChange, dependencies]);
    // 3. Hàm onChange (cho Input cơ bản) User nhập ⇒ update State
    const onChange = useCallback((e) => {
        const { name, value } = e.target;
        setFieldValue(name, value);
    }, [setFieldValue]);
    // 4. Validate lẻ từng field (khi rời input hoặc đóng Picker)
    const validateField = useCallback((name) => {
        const error = validateForm(formRef.current, fields, name, editItem);
        setErrors(prev => ({ ...prev, [name]: error }))
        return error;
    }, [fields, editItem])
    // 5. hàm hiển thị error khi input không còn focus
    const handleBlur = (e) => validateField(e.target.name);
    // 6. Validate toàn bộ — validate toàn bộ khi Submit ─────────────────────────
    const validate = useCallback(() => {
        const formErrors = validateForm(formRef.current, fields, null, editItem);
        if (formErrors) {
            setErrors(formErrors);
            const firstKey = Object.keys(formErrors)[0];
            return formErrors[firstKey]; // Trả về câu thông báo lỗi đầu tiên cho Swal            
        }
        setErrors({});
        return null;
    }, [fields, editItem]);
    // Lấy dữ liệu mới nhất cho 2 trường hợp là Create New và Update
    const getSubmitData = useCallback(() => {
        const submitData = {};
        fields.forEach(field => {
            const { name, form } = field;
            if (form?.skipSubmit) return;
            submitData[name] = formRef.current[name];
        })
        if (editItem && editItem.id) {
            submitData.updatedAt = new Date().toISOString()
        } else {
            submitData.createdAt = new Date().toISOString()
        }
        return submitData;

    }, [editItem, fields]);

    return {
        form,
        setForm,
        errors,
        setErrors,
        onChange,
        handleBlur,
        setFieldValue,
        validate,
        validateField, // Dùng để gọi khi đóng Picker
        getSubmitData,
        resetForm
    };
}