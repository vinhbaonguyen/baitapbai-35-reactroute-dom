import React, { useEffect, useRef, useState } from 'react'
import Modal from 'react-modal'
// import { getAll } from '../../services/classService';
import * as classService from '@/services/classService'
import { getModalStyle } from '../../constants/modalStyles';
import Draggable from 'react-draggable';

/**
 * ClassPickerModal — dùng chung cho 2 nơi:
 *
 * 1) ClassModal (logic CŨ — không đổi gì):
 *    <ClassPickerModal
 *        selected={['HCM-C-2605-01']}   ← classCode string
 *        onSave={(codes) => ...}
 *        onClose={...}
 *    />
 *
 * 2) ScoreModal (logic MỚI — thêm 2 props):
 *    <ClassPickerModal
 *        preFilteredData={form.classOptions}  ← data đã lọc sẵn, không gọi API
 *        selected={[form.classId]}            ← id number
 *        singleSelect={true}
 *        onSave={(ids) => ...}
 *        onClose={...}
 *    />
 */
export default function ClassPickerModal({
    // props gốc (ClassModal)
    selected = [],
    onSave,
    onClose,
    // props mới (ScoreModal)
    preFilteredData = null,  // nếu có → không gọi API
    singleSelect = false,    // nếu true → chọn 1, key là id
}) {
    // 1. CHỈ gọi API và quản lý state 'classes' khi KHÔNG CÓ preFilteredData (tức là dùng cho ClassModal cũ)
    const [classes, setClasses] = useState([])

    const [picked, setPicked] = useState(selected.map(x => singleSelect ? Number(x) : x))// ← ép về Number nếu singleSelect
    const [loading, setLoading] = useState(preFilteredData === null) // Nếu có data sẵn thì không cần loading
    const nodeRef = useRef(null)

    useEffect(() => {
        if (preFilteredData !== null) {
            // ScoreModal: dùng data truyền vào, không gọi API
            // eslint-disable-next-line
            setClasses(preFilteredData)
            setLoading(false)
        } else {
            // ClassModal: gọi API như cũ
            classService.getAll()
                .then(setClasses)
                .finally(() => setLoading(false))
        }
    }, [preFilteredData])

    // ClassModal dùng classCode, ScoreModal dùng id
    const getKey = (cls) => singleSelect ? Number(cls.id) : cls.classCode

    const toggle = (key) => {
        if (singleSelect) {
            // ScoreModal: chọn 1
            setPicked(prev => prev.includes(Number(key)) ? [] : [Number(key)])
        } else {
            // ClassModal: multi-select bằng classCode (logic cũ)
            setPicked(prev => prev.includes(key)
                ? prev.filter(x => x !== key)
                : [...prev, key])
        }
    }

    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            style={getModalStyle('400px')}
            shouldFocusAfterRender={false}
            shouldReturnFocusAfterClose={false}
            ariaHideApp={false}
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
            {/* ClassModal: "Các Lớp Đang Dạy" | ScoreModal: "Chọn Lớp Học" */}
            <h4 className="modal__header">
                {singleSelect ? 'Chọn Lớp Học' : 'Các Lớp Đang Dạy'}
            </h4>

            {loading
                ? <p style={{ textAlign: 'center', color: '#666' }}>Đang tải...</p>
                : classes.length === 0
                    ? <p style={{ textAlign: 'center', color: '#666' }}>
                        {singleSelect ? '⚠️ Học viên chưa được xếp lớp' : 'Chưa Có Lớp nào'}
                    </p>
                    : (
                        <div className='picker-list'>
                            {classes.map(cls => {
                                const key = getKey(cls)
                                const isActive = picked.includes(key)
                                return (
                                    <div
                                        className={`picker-item ${isActive ? 'picker-item--active' : ''}`}
                                        key={cls.id}
                                        onClick={() => toggle(key)} /* Khi click vào bất kỳ đâu trên hàng đều chạy duy nhất 1 lần toggle */
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <input
                                            className='picker-item__content'                                           
                                            type='checkbox'
                                            checked={isActive}
                                            readOnly
                                        />
                                        <div
                                            // style={{ cursor: 'pointer', flex: 1 }}
                                            className='picker-item__info'
                                            onClick={() => toggle(key)}
                                        >
                                            <p className='picker-item__label'>
                                                {cls.classCode}  -
                                            </p>
                                            <p className='picker-item__desc'>
                                                ( {cls.description} )
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )
            }

            <div className="modal__footer">
                <button className="btn btn--outline" onClick={onClose}>Hủy</button>
                <button
                    className="btn btn--primary"
                    disabled={picked.length === 0}
                    onClick={() => onSave(picked)}
                >
                    {singleSelect ? 'Xác Nhận' : `Xác Nhận (${picked.length})`}
                </button>
            </div>
        </Modal>
    )
}