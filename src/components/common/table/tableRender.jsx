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
    if (col.render) return col.render(row)

    // ── BƯỚC 5: Format value theo type (date, array, number...) ───
    const formatted = formatValue(value, fieldConfig, 'table')

    // ── BƯỚC 6: Render UI theo type ───────────────────────────────
    switch (type) {
        // Badge màu — status/badge dùng class CSS để tô màu
        // vd: badge--active, badge--inactive
        case 'status':
        case 'badge':
            return (
                <span className={`badge badge--${value?.toLowerCase()}`}>
                    {formatted}
                </span>
            );
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