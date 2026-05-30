import { formatDateDisplay } from "./date.utils";

export const buildFormFields = (
    fields,        // array field config
    rules = {},    // object rule
    context = {}   // object chứa thông tin người dùng
) => {
    const {
        pick = null,   // danh sách field muốn giữ lại
        remove = [],   // danh sách field muốn loại bỏ
        hidden = [],   // danh sách field muốn ẩn
        disabled = [], // danh sách field unfocus
        required = [], // danh sách field required
        adminOnly = [],
        custom = {}
    } = rules

    const { isAdmin = false } = context

    let result = fields
    // 1. Nếu có pick → chỉ giữ field được pick
    if (Array.isArray(pick) && pick.length > 0) {
        result = pick
            .map(name => result.find(f => f.name === name))
            .filter(Boolean)
            .map(f => ({
                ...f,
                form: { ...f.form },
                table: { ...f.table },
                history: { ...f.history }
            }))
    } else {
        // 2. Nếu không có pick → dùng remove
        result = result
            .filter(f => !remove.includes(f.name))
            .map(f => ({
                ...f,
                form: { ...f.form },
                table: { ...f.table },
                history: { ...f.history }
            }))
    }
    // 3. Admin-only
    result = result.filter(f => {
        if (!isAdmin && adminOnly.includes(f.name)) return false
        return true
    })
    // 4. Apply hidden / disabled / required / custom
    result = result.map(f => {
        const field = { ...f, form: { ...f.form } }
        if (hidden.includes(field.name)) field.form.hidden = true
        if (disabled.includes(field.name)) field.form.disabled = true
        if (required.includes(field.name)) field.form.required = true
        if (typeof custom[field.name] === 'function') {
            return custom[field.name](field, context) || field
        }
        return field
    })

    return result
}
// format chính
export const formatValue = (value, fieldConfig, mode = 'table') => {
    if (value === '' || value === null) return '-';
    // 👉 nếu có FIELD config → dùng
    const type = fieldConfig?.[mode]?.type
    if (type) {
        switch (type) {
            case 'date':
                return formatDateDisplay(value, 'vi-VN');
            case 'array':
                return Array.isArray(value) ? value.join(', ') : value;
            case 'boolean':
                return value ? 'True' : 'False'
            case 'status':
            case 'badge':
                return value; // UI xử lý ở render
            case 'number':
                return value?.toLocaleString?.() ?? value
            default:
                return String(value);
        }
    }
};

export const buildFieldMap = (fields = []) => {
    return fields.reduce((acc, f) => {
        acc[f.name] = f;
        return acc;
    }, {});
}

