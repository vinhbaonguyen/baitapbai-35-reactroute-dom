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
import { STUDENT_STATUS_OPTIONS } from '@/constants/students/student.constants'
import CoursePickerModal from '../CommonPickers/CoursePickerModal'
import SpecialtyPickerModal from '../CommonPickers/SpecialtyPickerModal'
import Draggable from 'react-draggable'

function SharedModal({ title, fields, editItem, onSave, onClose, statusOpts, newCode, courseData, displayMaps }) {
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
    // ── Submit ──────────────────────────────────────
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const errorMessage = validate();
        if (errorMessage) return alertError({title: `Vui lòng nhập "${errorMessage}"`})        
        // Nếu không có lỗi thì mới tiến hành submitData
        await onSave(getSubmitData());
    };
    // Hiển Thị giá trị được fill trên Modal 
    useEffect(() => {
        if (Object.keys(form).length > 0) {
            console.log(`=====Giá trị Edit Item`);
            console.table(form)
            console.log("=====Giá Trị Của Xem Xét Hiện Tại");
            console.table(editItem)
        }
    }, [form, editItem])
    //state quản lý đóng mở picker
    const [picker, setPicker] = useState(null);

    // Nếu là create New truyền new Student Code cho Modal
    useEffect(() => {
        if (!editItem && !form.studentCode) {
            setFieldValue('studentCode', newCode)
        }
    }, [editItem, form.studentCode, setFieldValue, newCode]);
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
                        handle='.modal__title'
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
                <h4 className="modal__title">{title}</h4>
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
                    selected={form.courseId}
                    onSave={(id) => {
                        setFieldValue('courseId', id)
                        setPicker(null)
                    }}
                    onClose={() => setPicker(null)}
                />
            )}
            {picker === 'status' && (
                <StatusPickerModal
                    current={form.status}
                    statusOpts={statusOpts}
                    onSelect={(val) => {
                        setFieldValue('status', val);
                        // validateField('status');       // ⭐ XÓA LỖI NGAY LẬP TỨC
                        setPicker(null);              // ⭐ ĐÓNG MODAL Ở ĐÂY         
                    }}
                    onClose={() => {
                        validateField('status');    // ⭐ Nếu user đóng modal mà không chọn
                        setPicker(null)
                    }}
                />
            )}
            {picker === 'categoryPicker' && (
                <SpecialtyPickerModal
                    current={form.category}
                    onClose={() => {
                        setPicker(null);
                        validateField('category');
                    }}
                    onSelect={(val) => {
                        setFieldValue('category', val);
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

