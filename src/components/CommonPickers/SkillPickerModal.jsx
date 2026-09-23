import React, { useMemo, useRef, useState } from 'react'
import Modal from 'react-modal'
// import { PRESET_SKILLS } from '../../constants/lecturer/lecturer.constants'
import { getModalStyle } from '../../constants/modalStyles'
import Draggable from 'react-draggable'
import { confirmPickerSelection } from '@/utils/confirmPickerSelection'
import { PRESET_SKILLS } from '@/constants/lecturer/lecture.master.fieldsConfig'



export default function SkillPickerModal({ selected = [], onSave, onClose, onEmptyConfirm }) {
    const [picked, setPicked] = useState([...selected])
    const [input, setInput] = useState('')
    const [search, setSearch] = useState('')

    const toogle = (skill) =>
        setPicked(prev => prev.includes(skill)
            ? prev.filter(s => s !== skill)
            : [...prev, skill])

    const addCustom = () => {
        const s = input.trim()
        if (s && !picked.includes(s)) setPicked(pre => [...pre, s])
        setInput('')
    }

    // const handleConfirm = async () => {
    //     if(!picked.length){
    //         const confirm = await alertConfirm({
    //             title: 'Bạn chưa chọn Kỹ Năng cho Giảng Viên',
    //             confirmButtonText: 'Quay lại Chọn',
    //             cancelButtonText: 'Thoát'
    //         })
    //         if (confirm.isConfirmed) return;
    //         if(confirm.isDismissed) onEmptyConfirm();
    //         onClose();
    //         return;
    //     }
    //     onSave(picked);
    //     onClose()
    // }
    const handleConfirm = () => confirmPickerSelection({
        picked,
        onSave,
        onClose,
        onEmptyConfirm,
        emptyTitle: 'Bạn chưa chọn Kỹ Năng'
    })



    const nodeRef = useRef(null)

    const filteredData = useMemo(() => {
        return PRESET_SKILLS.filter(skill => skill.toLowerCase().trim().includes(search?.toLowerCase().trim()))
    }, [search])

    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            style={getModalStyle('520px')}
            shouldFocusAfterRender={false}
            shouldReturnFocusAfterClose={false}
            ariaHideApp={false}              // ✅ tắt aria-hide hoàn toàn
            contentElement={(props, children) => (
                <Draggable
                    handle='.modal__header'
                    nodeRef={nodeRef}
                    defaultPosition={{ x: -180, y: -270 }}
                    position={null}
                >
                    <div {...props} ref={nodeRef}>
                        {children}
                    </div>
                </Draggable>
            )}
        >
            <h4 className='modal__header'>Chọn Kỹ Năng</h4>
            {/* ── THANH TÌM KIẾM + NÚT BATCH ── */}
            <div className='modal__search' >
                <input
                    type="text"
                    placeholder="Tìm theo tên kỹ năng"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <button
                    type="button"
                    className="btn btn--outline btn--unpaid"
                    onClick={() => setPicked([])}
                    disabled={picked.length === 0}
                >
                    Bỏ chọn tất cả
                </button>
            </div>
            {/* picker-list picker-list--row */}
            <div className='picker-grid'>
                {filteredData?.map(s => {
                    const isActive = picked.includes(s);
                    return (
                        <span
                            className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                            key={s}
                            onClick={() => toogle(s)}
                        >
                            <span className='picker-item__text'>{s}</span>
                            {isActive && (<span className='picker-item__check'>✓</span>)}
                        </span>
                    )
                })}
            </div>
            {/* Custom input */}
            <div className='picker-other'>
                <input
                    className='picker-other__input'
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustom()}
                    placeholder='Nhập kỹ năng khác rồi Enter...'
                />
                <button className='btn btn--outline' onClick={addCustom}>+ Thêm</button>
            </div>
            {/* Selected tags */}
            {picked.length > 0 && (
                <div className='picker-other-display'>
                    <p className='picker-other-display__quantity'>
                        Đã Chọn ({picked.length})
                    </p>
                    <div className='picker-other-display__content' >
                        {picked.map(s => (
                            <span key={s} className='picker-other-display__skill'> {s}
                                <span
                                    className='picker-other-display__delete'
                                    onClick={() => toogle(s)}>X
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="modal__footer">
                <button className='btn btn--outline' onClick={onClose}>Hủy</button>
                <button
                    className='btn btn--primary'
                    onClick={handleConfirm}>
                    Xác Nhận ({picked.length})
                </button>
            </div>
        </Modal>
    )
}
