import React from "react";

export const PickerBtn = ({
    label,
    value,
    pickerKey,
    placeholder,
    onOpen,
    error,
    isTagDisplay }) => {
    // Logic render nội dung bên trong nút
    const renderContent = () => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
            return (<span className='base-picker-btn__placeholder'>{placeholder}</span>)
        }
        if (isTagDisplay && Array.isArray(value)) {
            const displayTags = value.slice(0, 3); // lấy 3 cái đầu tiên hiển thị
            const moreCount = value.length - 3;
            return (
                <div className="base-tags-preview">
                    {displayTags.map(s => (
                        <span key={s} className='base-tag'>{s}</span>
                    ))}
                    {moreCount > 0 && (<span className='lm-tag lm-tag--more'>+{moreCount}</span>)}
                </div>
            );
        }
      
        // Trường hợp text bình thường (như Loại HĐ, Chuyên môn)
        return <span className='base-tag'>{value}</span>
    };

    return (
        <div className="form-item">
            <label>{label}</label>
            <div className="base-picker-wrap">
                <button
                    type="button"
                    className={`base-picker-btn ${error ? 'input--error' : ''}`}
                    onClick={() => onOpen(pickerKey)}
                >
                    {renderContent()}
                    <span className="base-picker-btn__arrow">▼</span>
                </button>
                {error && (<small className='error-msg'>{error}</small>)}
            </div>
        </div>
    )
}