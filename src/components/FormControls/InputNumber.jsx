import React, { useMemo } from 'react'

export default function InputNumber({
    name,
    value,
    onChange,
    placeholder = '',
    disabled = false,
    readOnly
}) {
    // Hiển thị dạng format
    const displayValue = useMemo(() => {
        if (value === null || value === undefined || value === '') return;
        const num = Number(value);
        if (isNaN(num)) return '';
        return num.toLocaleString('vi-VN');
    }, [value]);

    // Khi user nhập → bỏ format → convert về raw
    const handleChange = (e) => {
        if(readOnly) return;
        const raw = e.target.value.replace(/\D/g, '');
        const num = raw === '' ? '' : Number(raw);

        onChange({
            target: {
                name,
                value: num
            }
        });
    };


    return (
        <input
            name={name}
            value={displayValue }
            type='text'
            inputMode='numberic'
            onChange={handleChange }
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}

        />
    )
}
