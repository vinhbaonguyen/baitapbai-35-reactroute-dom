import React, { Children, useEffect, useRef, useState } from 'react'
import Modal from 'react-modal'
import Swal from 'sweetalert2'
import { useSelector } from 'react-redux'

// import {
//     CONTRACT_DESCRIPTION,
//     CONTRACT_SALARY,
//     LECTURE_DEGREE_OPTIONS,
//     LECTURE_STATUS_OPTIONS,   
// } from '../../constants/lecturer/lecturer.constants'
// import { LECTURE_FIELDS } from '../../constants/lecturer/lecture.fields'

import { getModalStyle } from '../../constants/modalStyles'
import './LectureModal.scss'
import '../../assets/styles/common.scss'
import ContractPickerModal from '../../components/CommonPickers/ContractPickerModal'
import SkillPickerModal from '../../components/CommonPickers/SkillPickerModal'
import ClassPickerModal from '../../components/CommonPickers/ClassPickerModal'
import StatusPickerModal from '../../components/CommonPickers/StatusPickerModal'
import SpecialtyPickerModal from '../../components/CommonPickers/SpecialtyPickerModal'
import useForm from '../../hooks/useForm'
import FormRenderer from '../../components/FormControls/FormRenderer'
import FormItem from '../../components/FormControls/FormItem'
import { PickerControl } from '../../components/FormControls/PickerControl'

import { buildFormFields } from '../../utils/field.util.jsx'
import { alertError } from '@/utils/alert'
import Draggable from 'react-draggable'
import { selectClasses } from '@/store/selectors/masterDataSelectors'
import DegreePickerModal from '@/components/CommonPickers/DegreePickerModal'
import { generateCode } from '@/utils/codeGenerator'
import InputNumber from '@/components/FormControls/InputNumber'
import {
    CONTRACT_DESCRIPTION,
    CONTRACT_SALARY,
    LECTURE_DEGREE_OPTIONS,
    LECTURE_FIELDS,
    LECTURE_STATUS_OPTIONS
} from '@/constants/lecturer/lecture.master.fieldsConfig'


const LECTURE_INFORMATION = buildFormFields(
    LECTURE_FIELDS,
    {
        pick: [
            'lectureName',
            'experienceYears',
            'email',
            'phone',
            'address',
            'dob',
            'gender'
        ]
    })

export default function LectureModal({ editItem, allLectures = [], specialtyData = [], onSave, onClose }) {
    const user = useSelector(state => state.auth.currentUser)
    const isAdmin = user?.role === 'ADMIN'

    const isEdit = !!editItem
    const [picker, setPicker] = useState(null) // 'contract'|'skills'|'classes'|'status'
    const {
        form,
        errors,
        onChange,
        handleBlur,
        setFieldValue,
        validate,
        validateField,
        getSubmitData
    } = useForm(
        {
            fields: LECTURE_FIELDS,
            editItem: editItem,
            dependencies: { allLectures },
            onFieldsChange: (name, value, curentForm, deps) => {
                let updatedForm = { ...curentForm };
                // Logic 1: Khi thay đổi loại Hợp đồng -> Tự tạo mã GV + Gán loại lương
                if (name === 'contractType') {
                    updatedForm.lectureCode = generateCode(value, deps.allLectures);
                    updatedForm.salaryType = CONTRACT_SALARY[value];
                }
                return updatedForm;
            }
        }
    );

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const err = validate();       
        
        if (err) {
            alertError({ title: `Vui lòng nhập "${err}"` })
            return
        }
        await onSave(getSubmitData())  // ✅ tự inject updatedAt = now trước khi save
    }
    // Hiển thị Tổng Lương cho Giá viên có loại Hợp Đồng 
    const totalSalary =
        form.salaryType === 'hourly'
            ? (Number(form.hourRate) || 0) * (Number(form.totalHours) || 0)
            : null;
    // Tải Class data từ Store            
    const classesData = useSelector(selectClasses);
    useEffect(() => {
        if (!editItem?.id) return; // CREATE mode: không có lớp nào

        const myClasses = classesData
            .filter(c => Number(c.lectureId) === Number(editItem.id))
            .map(c => c.classCode);

        setFieldValue('assignedClasses', myClasses);
        // console.log("📌 assignedClasses loaded:", myClasses);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editItem, classesData]);
    const nodeRef = useRef(null);

    return (
        <>
            <Modal
                isOpen={true}
                onRequestClose={onClose}
                style={getModalStyle('520px')}
                shouldFocusAfterRender={true}      // ✅ không auto-focus khi mở
                shouldReturnFocusAfterClose={true} // ✅ không return focus khi đóng                
                ariaHideApp={false}              // ✅ tắt aria-hide hoàn toàn
                contentElement={(props, children) => (
                    <Draggable
                        handle='.modal__header'
                        nodeRef={nodeRef}
                        defaultPosition={{ x: -180, y: -330 }}
                        position={null}
                    >
                        <div {...props} ref={nodeRef}>
                            {children}
                        </div>
                    </Draggable>
                )}
            >
                <h4 className="modal__header">
                    {isEdit ? `✏️ Sửa: ${editItem.lectureName}` : '➕ Thêm Giảng Viên Mới'}
                </h4>

                {/* ── Loại HĐ + Mã GV ── */}
                <p className="lm-section">📋 Hợp Đồng</p>
                <FormItem
                    label='Loại HĐ'
                    name='contractType'
                    error={errors.contractType}
                    variant='lecture'
                    layout='horizontal'
                    required
                >
                    <PickerControl
                        value={form.contractType ? CONTRACT_DESCRIPTION[form.contractType] : null}
                        pickerKey='contract'
                        onOpen={setPicker}
                        placeholder='Chọn loại hợp đồng...'
                        error={errors.contractType}
                        
                    />
                </FormItem>
                {/* Hiển thị Mã Giáo viên sau khi chọn xong loại Hợp đồng */}
                <FormItem
                    label='Mã GV'
                    name='lectureCode'
                    layout='horizontal'
                    variant='lecture'
                >
                    <input
                        value={form.lectureCode ?? ''}
                        placeholder='Tự động sau khi chọn loại HĐ'
                        disabled
                    />
                </FormItem>
                {/* ── Thông tin cá nhân ── */}
                <p className="lm-section">👤 Thông Tin Cá Nhân</p>
                <FormRenderer
                    fields={LECTURE_INFORMATION}
                    form={form}
                    onChange={onChange}
                    handleBlur={handleBlur}
                    errors={errors}
                    editItem={editItem}
                    variant='lecture'
                    layout='horizontal'
                />
                <FormItem
                    label='Bằng Cấp'
                    name='degree'
                    error={errors.degree}
                    layout='horizontal'
                    variant='lecture'
                >
                    <PickerControl
                        value={form.degree}
                        pickerKey='degree'
                        placeholder='Chọn Bằng Cấp của Giáo Viên'
                        onOpen={setPicker}
                        error={errors.degree}
                        displayType='text'
                    />
                </FormItem>
                {/* ── Chuyên môn ── */}
                <FormItem
                    label='Chuyên Môn'
                    name='specialtyName'
                    error={errors.specialtyName}
                    layout='horizontal'
                    variant='lecture'
                >
                    <PickerControl
                        value={form.specialtyName}
                        pickerKey='specialty'
                        placeholder='Chọn Chuyên Môn Của Giáo Viên'
                        onOpen={setPicker}
                        error={errors.specialtyName}
                        displayType='text'
                    />
                </FormItem>

                {/* Skills picker */}
                <FormItem
                    label='Kỹ Năng'
                    name='skills'
                    error={errors.skills}
                    layout='horizontal'
                    variant='lecture'
                >
                    <PickerControl
                        value={form.skills}
                        pickerKey='skills'
                        onOpen={setPicker}
                        placeholder='Chọn kỹ năng...'
                        error={errors.skills}
                        displayType='tag'
                    />
                </FormItem>

                {/* Classes picker */}
                <FormItem
                    label='Lớp dạy'
                    name='classes'
                    error={errors.assignedClasses}
                    layout='horizontal'
                    variant='lecture'
                >
                    <PickerControl
                        value={form.assignedClasses}
                        onOpen={setPicker}
                        pickerKey='classes'
                        placeholder='Chưa được phân công Đứng Lớp'
                        error={errors.assignedClasses}
                        displayType='tag'
                    />
                </FormItem>
                {/* ── Lương — dynamic theo loại HĐ ── */}
                {form.salaryType && form.salaryType !== 'other' && (
                    <>
                        <p className="lm-section">💰 Thông Tin Lương</p>
                        {form.salaryType === 'hourly' && (
                            <>
                                <FormItem
                                    label='Đơn giá/giờ'
                                    name='hourRate'
                                    layout='horizontal'
                                    variant='lecture'
                                    error={errors.hourRate}
                                >
                                    <InputNumber
                                        type="number"
                                        value={form.hourRate ?? ''}
                                        name='hourRate'
                                        onChange={onChange}
                                        placeholder="VD: 20"
                                    />
                                </FormItem>

                                <FormItem
                                    label='Tổng giờ'
                                    name='totalHours'
                                    error={errors.totalHours}
                                    layout='horizontal'
                                    variant='lecture'
                                >
                                    <input
                                        type="number"
                                        name='totalHours'
                                        value={form.totalHours ?? ''}
                                        onChange={onChange}
                                        placeholder="VD: 120" />
                                </FormItem>

                                <FormItem
                                    label='Tổng Lương (tạm tính)'
                                    name='totalSalary'
                                    layout='horizontal'
                                    variant='lecture'
                                >
                                    <InputNumber
                                        name='totalSalary'
                                        value={totalSalary ?? ''}
                                        readOnly={true}
                                    />
                                </FormItem>
                            </>
                        )}
                        {form.salaryType === 'monthly' && (
                            <FormItem
                                label='Lương tháng'
                                name='monthSalary'
                                error={errors.monthSalary}
                                layout='horizontal'
                                variant='lecture'
                            >
                                <InputNumber
                                    name='monthSalary'
                                    value={form.monthSalary ?? ''}
                                    onChange={onChange}
                                    placeholder='VD: 15000000'
                                />
                            </FormItem>
                        )}
                    </>
                )}

                {/* ── Trạng thái ── */}
                <p className="lm-section">📌 Trạng Thái</p>
                <FormItem
                    label='Trạng thái'
                    name='status'
                    error={errors.status}
                    layout='horizontal'
                    variant='lecture'
                >
                    <PickerControl
                        value={form.status}
                        onOpen={setPicker}
                        pickerKey='status'
                        placeholder='Chọn trạng thái...'
                        displayType='badge'
                    />
                </FormItem>

                <div className="modal__footer">
                    <button type='button' className="btn btn--outline" onClick={(e) => { e.stopPropagation(); e.target.blur(); onClose() }}>Hủy</button>
                    <button type='button' className="btn btn--primary" onClick={handleSubmit}>
                        {isEdit ? 'Cập Nhật' : 'Tạo Mới'}
                    </button>
                </div>
            </Modal>
            {/* ── Sub-modals ─────────────────────────────────────────────── */}
            {picker === 'contract' && (
                <ContractPickerModal
                    selected={form.contractType}
                    isAdmin={isAdmin}
                    isEditMode={!!editItem}
                    onSave={(contractType) => {
                        setFieldValue('contractType', contractType)
                        validateField('contractType')
                        setPicker(null)
                    }}
                    onClose={() => {
                        // LOGIC QUAN TRỌNG: Khi đóng modal, nếu chưa có giá trị thì báo lỗi ngay
                        // validateField('contractType')
                        setPicker(null)
                    }}
                    onEmptyConfirm={() => {
                        setFieldValue('contractType', '')
                        validateField('contractType')
                        setPicker(null)
                    }}
                />
            )}
            {picker === 'skills' && (
                <SkillPickerModal
                    selected={form.skills}
                    onSave={(val) => {
                        setFieldValue('skills', val)
                        validateField('skills')
                        setPicker(null)
                    }}
                    onEmptyConfirm={() => {
                        // user xác nhận "không chọn gì" → coi như giá trị rỗng, bắt lỗ
                        setFieldValue('skills', []);
                        validateField('skills')
                        setPicker(null)
                    }}

                    onClose={() => {
                        validateField('skills');
                        setPicker(null)
                    }}
                />
            )}
            {picker === 'assignedClasses' && (
                <ClassPickerModal
                    selected={form.assignedClasses}
                    readOnly={true}
                // onSave={(val) => {
                //     setFieldValue('assignedClasses', val);
                //     setPicker(null);
                // }}
                // onClose={() => {
                //     validateField('assignedClasses')
                //     setPicker(null);
                // }}
                // onSave={() => setPicker(null)}
                // onClose={() => setPicker(null)}
                />
            )}
            {picker === 'status' && (
                <StatusPickerModal
                    selected={form.status}
                    statusOpts={LECTURE_STATUS_OPTIONS}
                    onSave={val => {
                        setFieldValue('status', val);
                        validateField('status')
                        setPicker(null)
                    }}
                    onEmptyConfirm={() => {
                        setFieldValue('status', '');
                        validateField('status')
                        setPicker(null)
                    }}
                    onClose={() => { setPicker(null) }}
                />
            )}
            {picker === 'specialty' && (
                <SpecialtyPickerModal
                    selected={form.specialtyId}
                    specialtyData={specialtyData}
                    onSave={(val) => {
                        setFieldValue('specialtyId', val?.id || null);
                        setFieldValue('specialtyName', val?.name || '');
                        validateField('specialtyId'),
                            validateField('specialtyName'),
                            setPicker(null);
                    }}
                    onEmptyConfirm={() => {
                        setFieldValue('specialtyId', null);
                        setFieldValue('specialtyName', '');
                        validateField('specialtyId');
                        validateField('specialtyName');
                        setPicker(null)
                    }}
                    onClose={() => {
                        // validateField('specialty')
                        setPicker(null)
                    }}
                />
            )}
            {picker === 'degree' && (
                <DegreePickerModal
                    selected={form?.degree}
                    degreeOpts={LECTURE_DEGREE_OPTIONS}
                    onSave={val => {
                        setFieldValue('degree', val);
                        validateField('degree')
                        setPicker(null)
                    }}
                    onEmptyConfirm={() => {
                        setFieldValue('degree', '')
                        validateField('degree')
                        setPicker(null)
                    }}
                    onClose={() => {
                        setPicker(null);
                        // validateField('degree')
                    }}
                />
            )}
        </>
    )
}