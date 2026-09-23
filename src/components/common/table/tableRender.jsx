
import { formatValue } from "../../../utils/field.util.jsx";


export const renderCell = (col, row, fieldMap) => {
    // ── BƯỚC 1: Lấy config của field từ fieldMap ──────────────────
    const fieldConfig = fieldMap[col.field];     // lấy config của field
    // ── BƯỚC 2: Xác định type để biết cách render ─────────────────
    const type = fieldConfig?.table?.type || col.type || 'text';
    // ── BƯỚC 3: Xác định key để đọc value từ row ──────────────────
    const relationKey = fieldConfig?.table?.relationKey || col.relationKey;
    // ✅ Nếu là relation → đọc từ relationKey (lectureName, courseName)
    //    Nếu không      → đọc từ col.field như bình thường

    const value = (type === 'relation' && relationKey)
        ? row[relationKey]
        : row[col.field];

    // ── BƯỚC 4: Nếu col có hàm render tự định nghĩa → ưu tiên dùng ──
    if (col.render && type !== 'badge') return col.render(row)

    // ── BƯỚC 5: Format value theo type (date, array, number...) ───
    const formatted = formatValue(value, fieldConfig, 'table')

    // ── BƯỚC 6: Render UI theo type ───────────────────────────────
    switch (type) {
        // Badge màu — status/badge dùng class CSS để tô màu
        // vd: badge--active, badge--inactive
        // case 'status':
        // case 'badge':
        //     return (
        //         <span className={`badge badge--${value?.toLowerCase()}`}>
        //             {formatted}
        //         </span>
        //     );
        case 'status':
        case 'badge': {
            // Nếu value là object (AuditLog)
            const badge = typeof col.render === 'function'
                ? col.render(row)
                : null;

            if (badge && typeof badge === 'object') {
                return (
                    <span className={`badge badge--${badge.color}`}>
                        {badge.icon} {badge.label}
                    </span>
                )
            }
            // Nếu value là string (status, active/inactive)
            return (
                <span className={`badge badge--${value?.toLowerCase()}`}>
                    {formatted}
                </span>
            )
        }
        case 'boolean': {
            // console.log('=== boolean debug ===');
            // console.log('value:', value);
            // console.log('typeof value:', typeof value);
            const boolValue = value === true || value === 'true'
            // console.log('boolValue:', boolValue);
            // 1. Định nghĩa các bộ Options cho từng loại field boolean khác nhau
            const BOOLEAN_MAPPING_OPTIONS = {
                // Cấu hình cho trường Cấp Bằng cũ của bạn
                certificateIssued: [
                    { value: true, label: 'Đã cấp', color: 'green', icon: '🎓' },
                    { value: false, label: 'Chưa cấp', color: 'gray', icon: '⏳' }
                ],
                // hasPaidFee: [
                //     { value: true, label: 'Đã đóng', color: 'green', icon: '✅' },
                //     { value: false, label: 'Chưa đóng', color: 'orange', icon: '⏳' }
                // ],

                default: [
                    { value: true, label: 'True', color: 'green', icon: '🟢' },
                    { value: false, label: 'False', color: 'red', icon: '🔴' }

                ]
            };

            // 2. Lấy bộ Options tương ứng với field hiện tại, nếu không có thì lấy bộ default
            const currentOptions = BOOLEAN_MAPPING_OPTIONS[col.field] || BOOLEAN_MAPPING_OPTIONS.default;
            // 3. Tìm option khớp với giá trị true/false

            const option = currentOptions.find(opt => opt.value === boolValue)
            // console.log('option found:', option);
            if (!option) return '-'
            return (
                <span className={`badge badge--${option.color}`}>
                    {option.icon} {option.label}
                </span>
            );
        }
        // Relation — chỉ hiện text, value đã được map sang tên ở BƯỚC 3
        case 'relation':
            return formatted ?? '-';
        // Array — vd: ['React', 'Vue'] → 'React, Vue' (formatValue lo)
        case 'array':
            return formatted ?? '-';
        // Date — formatValue đã format thành dd/mm/yyyy
        case 'date':
            return formatted ?? '-';
        // Number — formatValue đã thêm dấu phân cách (toLocaleString)
        case 'number':
            return formatted ?? '-';
        default:
            return formatted ?? '-';
    }
}

export const renderPaidSummaryCell = (row) => {
    const text = row.paidSummary || '--';
    const paidCount = parseInt(text.split('/')[0], 10);
    const isPaid = paidCount > 0; // Nếu có ít nhất 1 khóa học đã đóng học phí → đánh dấu là đã đóng
    return (
        <div className={`badge badge--${isPaid ? 'active' : 'inactive'}`}>
            {text} <br />
            {isPaid ? 'Đã đóng' : 'Chưa đóng'}
        </div>)
}
