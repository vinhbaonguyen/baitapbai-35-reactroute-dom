import React from 'react'
import FormItem from './FormItem'
import { PickerControl } from './PickerControl'

export default function FormRenderer({
    fields,
    form,
    errors,
    onChange,
    handleBlur,
    // editItem,
    variant,
    layout,
    setPicker,
    validateField,    
    extraDisabled,
    displayMaps
}) {
    // ===== Helper: chuẩn hóa type =====
    const normalizeType = (f) => {
        if (!f.form) return null;
        // Nếu là picker → ép type = 'picker'
        if (f.form.inputType === 'picker') return 'picker';
        // Ưu tiên form.type → fallback f.type → fallback 'text'
        return f.form.type || f.type || 'text';
    };
    // ===== Helper: map display value =====
    const getDisplayValue = (fieldName, value) => {
        if(!displayMaps || !displayMaps[fieldName]) return undefined;

        const map = displayMaps?.[fieldName];
       
        if (Array.isArray(value)) {
            return value.map(id => map[id] || id).join(', ');
        }
        return map[value] || '';
    };


    return (
        <>
            {fields
                ?.filter(f => f.form && !f.form?.hidden && !f.form?.skipRender)
                ?.map(f => {
                    // ✅ 2. Ưu tiên config mới (form), fallback config cũ
                    const type = normalizeType(f);
                    const required = f.form?.required ?? false;
                    const options = f.form?.options || [];                    
                    const isDisabled = extraDisabled?.[f.name] ?? f.form?.disabled ?? false;
                    let value = form[f.name] ?? '';
                    const displayValue = getDisplayValue(f.name, value);
                    if (!type) {
                        console.warn(`⚠ Field "${f.name}" thiếu form.type → bỏ qua`)
                        return null;
                    }

                    return (
                        <React.Fragment key={f.name} >
                            <FormItem
                                label={f.label}
                                name={f.name}
                                error={errors[f.name]}
                                required={required}
                                disabled={isDisabled}
                                layout={layout}
                                variant={variant}
                            >
                                {/* ===== SELECT ===== */}
                                {type === 'select' && (
                                    <select
                                        name={f?.name}
                                        value={value}
                                        onChange={onChange}
                                        onBlur={handleBlur}
                                        disabled={isDisabled}
                                    >
                                        {options?.map(opt => {
                                            const o = typeof opt === 'string'
                                                ? { value: opt, label: opt }
                                                : opt;
                                            return (
                                                <option key={o.value} value={o.value} >
                                                    {o.label}
                                                </option>
                                            );
                                        })}
                                    </select>
                                )}
                                {/* ===== RADIO ===== */}
                                {type === 'radio' && (
                                    <div className="form-item__radio-group">
                                        {options?.map(opt => {
                                            const o = typeof opt === 'string'
                                                ? { value: opt, label: opt }
                                                : opt;

                                            return (
                                                <label key={o.value} className="form-item__radio">
                                                    <input
                                                        type="radio"
                                                        name={f?.name}
                                                        value={o.value}
                                                        checked={value === o.value}
                                                        onChange={onChange}
                                                        onBlur={handleBlur}
                                                        disabled={isDisabled}
                                                    />
                                                    {o.label}
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                                {/* ===== PICKER CONTROL ===== */}
                                {f.form?.inputType === 'picker' && (
                                    <PickerControl
                                        displayValue={displayValue}
                                        value={value}
                                        // value={displayValue ?? form?.[f.name]}
                                        disabled={isDisabled}
                                        pickerKey={f.form.pickerKey}
                                        placeholder={f.form.placeholder}
                                        onOpen={() => {
                                            if (!isDisabled) {
                                                setPicker(f.form.pickerKey);
                                                validateField(f.name);
                                            }
                                        }}
                                        error={errors[f.name]}
                                        displayType='tag'
                                    />)
                                }
                                {/* ===== INPUT DEFAULT ===== */}
                                {['text', 'number', 'date', 'email'].includes(type) && (
                                    <input
                                        name={f.name}
                                        type={type}
                                        value={value}
                                        onChange={onChange}
                                        onBlur={handleBlur}
                                        disabled={isDisabled}
                                        required={required}
                                        placeholder={f.form.placeholder}
                                        readOnly={f.form.readOnly}
                                    />
                                )}
                                {/* ===== UNKNOWN TYPE ===== */}
                                {!['select', 'radio', 'picker', 'text', 'number', 'date', 'email'].includes(type) && (
                                    <div style={{ color: 'red' }}>
                                        ⚠ Không hỗ trợ type: {type}
                                    </div>
                                )}
                            </FormItem>
                        </React.Fragment>
                    )
                })}
        </>
    )
}
