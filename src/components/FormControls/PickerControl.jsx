/**
 * PickerControl — chỉ là button thuần, không có label/error
 * Dùng làm children của FormItem để tận dụng layout/CSS của FormItem
 *
 * Khác với PickerBtn (tự quản label + error):
 *   <FormItem label="..." error={...}>
 *       <PickerControl ... />   ← FormItem lo layout
 *   </FormItem>
 */

import React from 'react'

// ── Helper render nội dung bên trong button ────────────────────────────────
const renderContent = (value, placeholder, displayValue, displayType) => {
    // Nếu có displayValue (ví dụ: courseName) → ưu tiên hiển thị nó
    if (displayValue) {
        return <span className="base-tag">{displayValue}</span>
    }
    // Rỗng → hiện placeholder
    if (!value || (Array.isArray(value) && value.length === 0)) {
        return <span className="base-picker-btn__placeholder">{placeholder}</span>
    }
    // displayType:tag có nghĩa có field (skills, assignedClasses...)
    // có value là Array → hiển thị multi 
    if (displayType === 'tag' && Array.isArray(value)) {
        const displayed = value.slice(0, 3)
        const more = value.length - 3
        return (
            <div className="base-tags-preview">
                {displayed.map(s => <span key={s} className="base-tag">{s}</span>)}
                {more > 0 && <span className="base-tag base-tag--more">+{more}</span>}
            </div>
        )
    }
    // BADGE (status)
    if (displayType === 'badge') {
        return (
            <span className={`badge badge--${value.toLowerCase()}`}>
                {value}
            </span>
        )
    }
    // TEXT (default)
    return <span className='base-tag'>{value}</span>
}
export const PickerControl = ({
    value,
    pickerKey,
    placeholder = 'Chọn ....',
    onOpen,
    error,
    displayType = 'text',
    displayValue,
    disabled
}) => (
    <button
        type='button'
        disabled={disabled}
        className={`base-picker-btn ${error ? 'input--error' : ''}`}
        onClick={() => { if (!disabled) onOpen(pickerKey) }}
    >
        {renderContent(value, placeholder, displayValue, displayType)}
        <span className="base-picker-btn__arrow">▼</span>
    </button>
)

