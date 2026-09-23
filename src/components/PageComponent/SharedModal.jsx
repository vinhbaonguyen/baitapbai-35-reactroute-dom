import Modal from 'react-modal'
import './PageComponent.scss'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import React, { memo, useEffect, useRef, useState } from 'react'
import { getModalStyle } from '../../constants/modalStyles'
import useForm from '../../hooks/useForm'
import FormRenderer from '../FormControls/FormRenderer'
import { alertError } from '@/utils/alert'
import ClassPickerModal from '../CommonPickers/ClassPickerModal'
import FormItem from '../FormControls/FormItem'
import StatusPickerModal from '../CommonPickers/StatusPickerModal'
import { PickerControl } from '../FormControls/PickerControl'
import { STUDENT_STATUS_OPTIONS } from '@/constants/students/student.constants.jsx'
import CoursePickerModal from '../CommonPickers/CoursePickerModal'
import SpecialtyPickerModal from '../CommonPickers/SpecialtyPickerModal'
import Draggable from 'react-draggable'
import { useSelector } from 'react-redux'

function SharedModal(
    {   title,
        fields,
        editItem,
        onSave,
        onClose,
        statusOpts,
        // newCode,
        courseData,
        displayMaps,
        specialtyData
    }) {
    // ── Form state ────────────────────────────────
    const {
        form,
        errors,
        onChange,
        handleBlur,
        setFieldValue,
        validate,
        validateField,
        getSubmitData,
    } = useForm({ fields, editItem })
    // ── 🔥 NEW: paidFeeMap state ────────────────────────────────
    // paidFeeMap = { courseId: true/false }
    // Ví dụ: { 1: false, 5: true, 16: false }

    // useEffect(() => {
    //     console.log('data của Edit Data', editItem);

    // }, [editItem])

    // Lấy studentCourse từ Redux để khởi tạo paidFeeMap khi Edit
    const studentCourseList = useSelector(state => state.masterData.studentCourse);

    const [paidFeeMap, setPaidFeeMap] = useState({});
    const initializedForId = useRef(null);


    useEffect(() => {
        if (!editItem) {
            // eslint-disable-next-line
            setPaidFeeMap({});
            initializedForId.current = null;           
            return;
        }
        // Nếu đã init cho đúng học viên này rồi → không ghi đè nữa
        // (tránh mất tick checkbox user vừa chọn khi Redux đổi)
        if (initializedForId.current === editItem.id) return;

        const existing = studentCourseList.filter(
            sc => Number(sc.studentId) === Number(editItem.id)
        );

        const map = {};
        existing.forEach(sc => {
            map[Number(sc.courseId)] = sc.hasPaidFee ?? false;
        });

        setPaidFeeMap(map);
        initializedForId.current = editItem.id; // ✅ đánh dấu đã init xong
    }, [editItem, studentCourseList]);

 

    // Handler: user tick/untick checkbox của 1 course
    const handleTogglePaid = (courseId) => {
        setPaidFeeMap(prev => ({
            ...prev,
            [Number(courseId)]: !prev[Number(courseId)]
        }))
    }

    // ── Submit ──────────────────────────────────────
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const errorMessage = validate();
        if (errorMessage) return alertError({ title: `Vui lòng nhập "${errorMessage}"` })
        // Nếu không có lỗi thì mới tiến hành submitData
        // await onSave(getSubmitData());
        await onSave({
            ...getSubmitData(),
            courseIds: form.courseIds,
            paidFeeMap: paidFeeMap
        })
    };
    // Hiển Thị giá trị được fill trên Modal 
    // useEffect(() => {
    //     if (Object.keys(form).length > 0) {
    //         console.log(`=====Giá trị Edit Item`);
    //         console.table(form)
    //         console.log("=====Giá Trị Của Xem Xét Hiện Tại");
    //         console.table(editItem)
    //     }
    // }, [form, editItem])
    //state quản lý đóng mở picker
    const [picker, setPicker] = useState(null);

    // Nếu là create New truyền new Student Code cho Modal
    // useEffect(() => {
    //     if (!editItem && !form.studentCode) {
    //         setFieldValue('studentCode', newCode)
    //     }
    // }, [editItem, form.studentCode, setFieldValue, newCode]);
    const nodeRef = useRef(null)
    return (
        <>
            <Modal
                isOpen={true}
                onRequestClose={onClose}
                style={getModalStyle('420px')}
                shouldFocusAfterRender={false}
                shouldReturnFocusAfterClose={false}
                ariaHideApp={false}     // ✅ tắt aria-hide hoàn toàn
                contentElement={(props, children) => (
                    <Draggable
                        handle='.modal__header'
                        nodeRef={nodeRef}
                        defaultPosition={{ x: -180, y: -280 }}
                        position={null}
                    >
                        <div {...props} ref={nodeRef}>
                            {children}
                        </div>
                    </Draggable>
                )}
            >
                <h4 className="modal__header">{title}</h4>
                <FormRenderer
                    fields={fields}
                    form={form}
                    onChange={onChange}
                    handleBlur={handleBlur}
                    errors={errors}
                    editItem={editItem}
                    variant='shared'
                    layout='horizontal'
                    setPicker={setPicker}
                    validateField={validateField}
                    courseData={courseData}
                    displayMaps={displayMaps}
                />
                {/* 🔥 Bảng hasPaidFee — hiện khi đã chọn ít nhất 1 course */}
                {(form.courseIds?.length > 0) && (
                    <div className="modal__paid-fee">
                        <p className="modal__paid-fee-title">💳 Trạng Thái Học Phí</p>
                        <table className="paid-fee-table">
                            <thead>
                                <tr>
                                    <th>Khóa Học</th>
                                    <th style={{ textAlign: 'center' }}>Đã Đóng HP?</th>
                                </tr>
                            </thead>
                            <tbody>
                                {form.courseIds.map(cid => {
                                    const course = courseData?.find(c => Number(c.id) === Number(cid))
                                    const isPaid = paidFeeMap[Number(cid)] ?? false
                                    return (
                                        <tr key={cid}>
                                            <td>{course?.courseName ?? `ID: ${cid}`}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isPaid}
                                                    onChange={() => handleTogglePaid(cid)}
                                                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                                                />
                                                <span style={{ marginLeft: 6, fontSize: 12 }}>
                                                    {isPaid ? 'Đã đóng' : 'Chưa đóng'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* <FormItem
                    label='Trạng thái'
                    name='status'
                    error={errors.status}
                    layout='horizontal'
                    variant='default'
                >
                    <PickerControl
                        value={form.status}
                        onOpen={setPicker}
                        pickerKey='status'
                        placeholder='Chọn trạng thái...'
                        displayType='badge'
                    />
                </FormItem> */}
                <div className="modal__footer">
                    <button className="btn btn--outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn--primary" onClick={handleSubmit}>Save</button>
                </div>
            </Modal>
            {picker === 'coursePicker' && (
                <CoursePickerModal
                    courseData={courseData}
                    selected={form.courseIds ?? []}
                    onSave={(ids) => {
                        setFieldValue('courseIds', ids)
                        validateField('courseIds')
                        setPicker(null)
                        // 🔥 Sync paidFeeMap ngay tại đây — KHÔNG dùng useEffect
                        setPaidFeeMap(prev => {
                            const next = {}
                            ids.forEach(cid => {
                                // Course cũ → giữ nguyên giá trị
                                // Course mới → mặc định false
                                next[Number(cid)] = prev[Number(cid)] ?? false

                            })
                            return next
                        })

                    }}
                    onEmptyConfirm={() => {
                        setFieldValue('courseIds', [])
                        validateField('courseIds')
                        setPaidFeeMap({})
                        setPicker(null)
                    }}
                    onClose={() => setPicker(null)}
                    singleSelect={false}   // ✅ multi-select cho Student
                />
            )}
            {picker === 'status' && (
                <StatusPickerModal
                    selected={form.status}
                    statusOpts={statusOpts}
                    onSave={(val) => {
                        setFieldValue('status', val);
                        validateField('status');
                        setPicker(null);
                    }}
                    onEmptyConfirm={() => {
                        setFieldValue('status', '')
                        validateField('status')
                        setPicker(null)
                    }}
                    onClose={() => {
                        setPicker(null)
                    }}
                />
            )}
            {picker === 'categoryPicker' && (
                <SpecialtyPickerModal
                    // selected={form.specialtyName}
                    onClose={() => {
                        setPicker(null);

                    }}
                    specialtyData={specialtyData}
                    selected={form.specialtyId}

                    onSave={(val) => {
                        // val = {id, name} hoặc null (khi bỏ chọn)
                        setFieldValue('specialtyName', val?.name ?? '');
                        setFieldValue('specialtyId', val?.id ?? '');
                        validateField('specialtyName');
                        validateField('specialtyId');
                        setPicker(null)
                    }}
                    onEmptyConfirm={() => {
                        setFieldValue('specialtyName', '');
                        setFieldValue('specialtyId', '');
                        validateField('specialtyName');
                        validateField('specialtyId');
                        setPicker(null)
                    }}
                    modalTitle='course'
                />
            )
            }
        </>
    )
}

export default memo(SharedModal)

