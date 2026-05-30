import React, { useEffect, useRef, useState } from 'react'
import Modal from 'react-modal'
import { generateClassCode, getClassIndexInMonth } from '@/utils/class.utils';
import { CLASSES_FIELDS } from '@/constants/classes/classes.fields';
import useForm from '@/hooks/useForm';
import { getModalStyle } from '@/constants/modalStyles';
// import { useSelector } from 'react-redux';
import { alertConfirm, alertError, alertSuccess } from '@/utils/alert';
import FormRenderer from '@/components/FormControls/FormRenderer';
import LecturePickerModal from '@/components/CommonPickers/LecturePickerModal';
import StatusPickerModal from '@/components/CommonPickers/StatusPickerModal';
import { BRAND_NAME, CLASSES_STATUS_OPTIONS } from '@/constants/classes/classes.constant';
import CoursePickerModal from '@/components/CommonPickers/CoursePickerModal';
import BranchPickerModal from '@/components/CommonPickers/BranchPickerModal';
import StudentListPickerModal from '@/components/CommonPickers/StudentListPickerModal';
import * as studentClassService from '../../services/studentClassService'
import { compareData } from '@/utils/compareData';
import Draggable from 'react-draggable';
import useLookupMaps from '@/hooks/useLookupMap';
import { useSelector } from 'react-redux';
import { selectCourses, selectLectures, selectStudents } from '@/store/selectors/masterDataSelectors';
// Hàm tạo Mã ClassCode
const generateClassCodeForClass = (courseName, allClasses, branch) => {
    const index = getClassIndexInMonth(allClasses);
    return generateClassCode({ courseName, branch, index });
};
export default function ClassModal({
    editItem,
    onSave,
    onClose,
    onWriteLog,     // ✅ thêm prop này — callback ghi history từ Class.jsx
    allClasses = [],
}) {
    const isEdit = !!editItem;
    console.log("Giá Trị 1 Object Class được chọn để Edit", editItem);

    const [picker, setPicker] = useState(null);
    //state quản lý enable hay unenable cho StudentListPickerModal
    const [isStudentPickerEnabled, setIsStudentPickerEnabled] = useState(() => editItem ? true : false)

    // ✅ enrichedEditItem: editItem + studentList từ student_class
    // Cần để compareData so sánh đúng: formData.studentList vs editItem.studentList
    const [enrichedEditItem, setEnrichedEditItem] = useState(editItem);

    const courseData = useSelector(selectCourses);
    const lectureData = useSelector(selectLectures);
    const studentData = useSelector(selectStudents);


    // ✅ Load studentList đã assign khi mở EDIT ⇒ enrichedEditItem   
    useEffect(() => {
        if (!editItem?.id) {
            setEnrichedEditItem(editItem);// CREATE mode: : không cần enrich
            return;
        }
        // EDIT mode: load danh sách student đã assign vào class
        studentClassService.getByClassId(editItem.id)
            .then(list => {
                const ids = list.map(sc => sc.studentId);
                // Gán studentList vào editItem để compareData có gốc để so sánh
                setEnrichedEditItem({ ...editItem, studentList: ids });
                console.log("📌 enrichedEditItem.studentList:", ids);
            });
    }, [editItem]);

    // Step 2: Sync studentList vào form khi enrichedEditItem load xong   
    // useRef đảm bảo chỉ chạy 1 lần (tránh loop)
    const hasInitStudents = useRef(false);
    useEffect(() => {
        if (!enrichedEditItem?.studentList || hasInitStudents.current) return;
        setFieldValue('studentList', enrichedEditItem.studentList);
        hasInitStudents.current = true;
        console.log("📌 form.studentList synced:", enrichedEditItem.studentList);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enrichedEditItem]);

    const {
        form, errors,
        onChange, handleBlur,
        setFieldValue, validate,
        validateField, getSubmitData } = useForm({
            fields: CLASSES_FIELDS,
            editItem: enrichedEditItem,    // ✅ dùng enrichedEditItem thay vì editItem
            dependencies: { allClasses, courseData },
            onFieldsChange: (name, value, currentForm, deps) => {
                let updatedForm = { ...currentForm };
                // ===== AUTO-GENERATE CLASS CODE =====
                // ✅ Chỉ generate khi user thay đổi courseId HOẶC branch               
                if (name === 'courseId' || name === 'branch') {
                    const courseId = name === 'courseId' ? value : currentForm.courseId;
                    const branch = name === 'branch' ? value : currentForm.branch;

                    if (courseId && branch) {
                        const course = deps.courseData.find(c => Number(c.id) === Number(courseId));
                        if (course) {
                            // Lọc đúng danh sách lớp theo courseId và branch
                            const classesOfCourse = deps.allClasses.filter(c =>
                                Number(c.courseId) === Number(courseId) && c.branch === branch);

                            const code = generateClassCodeForClass(course.courseName, classesOfCourse, branch);

                            // ✅ ĐÚNG: gán thẳng vào updatedForm rồi return
                            updatedForm.classCode = code;
                        }
                    }
                    // Nếu xóa courseId hoặc branch → xóa classCode
                    if (!courseId || !branch) updatedForm.classCode = ''
                }
                // ===== AUTO-FILL DESCRIPTION THEO COURSE =====
                // --- reset lại studentList,classNumber khi chọn courseId khác trong ClassModal
                if (name === 'courseId') {
                    const selectedCourse = deps.courseData.find(c => Number(c.id) === Number(value));
                    console.log('selectedCourse:', selectedCourse); // null = vẫn lỗi, object = đúng rồi
                    updatedForm.description = selectedCourse?.category || '';
                    updatedForm.studentList = [];
                    // classNumber là sĩ số sinh viên của Course (đặt tên sai tính sau)
                    updatedForm.classNumber = 0;

                }
                // ===== BẬT/TẮT StudentPicker (chỉ CREATE) =====
                if (name === 'courseId' && !editItem) {
                    setIsStudentPickerEnabled(!!value);
                }
                // ===== AUTO-FILL Number of Student assigned in Class =====
                // Khi user xác nhận StudentListPicker → studentList thay đổi
                // → classNumber tự cập nhật theo số lượng
                if (name === 'studentList') {
                    updatedForm.classNumber = Array.isArray(value) ? value.length : 0;
                }

                return updatedForm;
            }
        });

    // ✅ STEP 3: handleSubmit
    // compareData bên trong onSave đã so sánh studentList tự động
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const error = validate()
        if (error) {
            alertError({ title: `Vui Lòng Nhập "${error}"` })
            return;
        }
        try {
            if (isEdit) {
                // ✅ Gộp studentList vào formData để compareData thấy được
                const formDataWithStudents = {
                    ...getSubmitData(),
                    studentList: form.studentList || []
                };
                // ✅ compareData với enrichedEditItem (có studentList gốc)
                const { isChanged, changedFields } = compareData({
                    formData: formDataWithStudents,
                    editItem: enrichedEditItem,
                    fields: CLASSES_FIELDS
                })
                console.log("📌 isChanged:", isChanged);
                console.log("📌 changedFields:", changedFields);
                // Không có thay đổi
                if (!isChanged) {
                    await alertConfirm({
                        title: 'Không có thay đổi',
                        text: 'Bạn chưa thay đổi dữ liệu?',
                        confirmText: 'Tiếp tục sửa',
                        cancelText: 'Không (Đóng)'
                    });
                    return;
                }
                // Có thay đổi → confirm
                const confirmEdit = await alertConfirm({
                    title: 'Xác nhận cập nhật',
                    html: `<div style="text-align:left">
                            ${changedFields.map(f => `
                                <p><b>${f.label || f.field}</b>:
                                    <span style="color:red">${f.originalValue ?? '-'}</span> ⇒
                                    <span style="color:green">${f.formValue ?? ''}</span>
                                </p>`).join('')}
                            </div>`,
                    confirmText: 'Xác nhận Lưu',
                    cancelText: 'Quay lại chỉnh sửa'
                });
                if (!confirmEdit.isConfirmed) return;

                // ✅ onSave = handleClassSave → chỉ gọi API + update UI, không compare lại
                const savedResult = await onSave(getSubmitData());
                if (!savedResult) return;
                // ✅ Assign students
                await studentClassService.assignStudents(editItem.id, form.studentList || []);
                // ✅ Ghi history — truyền changedFields đầy đủ bao gồm studentList
                if (onWriteLog) {
                    await onWriteLog(
                        'UPDATE',
                        { ...savedResult, studentList: form.studentList || [] }, // newItem
                        enrichedEditItem, // có studentList gốc để so sánh,                       
                    );
                    console.log("✅ writeLog EDIT:", changedFields);

                }
                alertSuccess({ title: 'Cập Nhật Thành Công' });
                onClose();

            } else {
                // CREATE: gọi onSave → lấy id mới → assign students
                const savedClass = await onSave(getSubmitData());
                if (!savedClass?.id) return;
                if (form.studentList?.length > 0) {
                    await studentClassService.assignStudents(savedClass.id, form.studentList)
                }
                // ✅ Ghi history CREATE  — oldItem = null, writeLog bỏ qua changedFields
                if (onWriteLog) {
                    await onWriteLog(
                        'CREATE',
                        {
                            ...savedClass,
                            studentList: form.studentList || [],
                        });
                    console.log("✅ writeLog CREATE:", savedClass.id);

                }
                alertSuccess({ title: 'Tạo Mới Thành Công' });
                onClose();
            }

        } catch (err) {
            console.error("❌ handleSubmit lỗi:", err);
            alertError({ title: 'Lưu thất bại!' });
        }
    }

    // Map data kiểu dạng số (ví dụ courseId) thành courseName
    const courseMap = useLookupMaps(courseData, 'id', 'courseName')
    const lectureMap = useLookupMaps(lectureData, 'id', 'lectureName')
    const studentMap = useLookupMaps(studentData, 'id', 'studentName')
    console.log("Giá Trị của studentMap", studentMap);
    const lookUpMaps = {
        courseId: courseMap,
        lectureId: lectureMap,
        studentList: studentMap  // 👈 nhớ đúng key với CLASSES_FIELDS.name
    }

    // useEffect(() => {
    //     if (!form) return;
    //     console.log("==Data do Người Dùng Nhập và Dữ Liệu Hiện tại===");
    //     console.log('Data do Người Dùng Nhập');
    //     console.table(form);
    //     console.log('Dữ Liệu Hiện tại');
    //     console.table(editItem)
    //     console.table('Dữ Liệu Classes Hiện tại', allClasses)

    // }, [form, editItem, allClasses]);

    const nodeRef = useRef(null);

    return (
        <>
            <Modal
                isOpen={true}
                onRequestClose={onClose}
                style={getModalStyle('440px')}
                shouldFocusAfterRender={false}      // ✅ không auto-focus khi mở
                shouldReturnFocusAfterClose={false} // ✅ không return focus khi đóng               
                ariaHideApp={false}              // ✅ tắt aria-hide hoàn toàn

                contentElement={(props, children) => (
                    <Draggable
                        handle='.modal__title'
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
                {/* ======= TẤT CẢ NỘI DUNG MODAL Ở ĐÂY ======= */}
                <h4 className="modal__title">
                    {isEdit ? `✏️ Sửa: ${editItem.classCode}` : `➕ Thêm Lớp Học Mới `}
                </h4>
                <FormRenderer
                    fields={CLASSES_FIELDS}
                    form={form}
                    errors={errors}
                    onChange={onChange}
                    handleBlur={handleBlur}
                    editItem={editItem}
                    variant='lecture'
                    layout='horizontal'
                    setPicker={setPicker}
                    validateField={validateField}
                    extraDisabled={{ studentList: !isStudentPickerEnabled }}
                    displayMaps={lookUpMaps}
                />
                {/* ====== Modal Footer ============== */}
                <div className="modal__footer">
                    <button
                        type='button'
                        className="btn btn--outline"
                        onClick={(e) => { e.stopPropagation(); e.target.blur(); onClose() }}
                    >
                        Hủy
                    </button>
                    <button
                        type='button'
                        className="btn btn--primary"
                        onClick={handleSubmit}
                    >
                        {isEdit ? 'Cập Nhật' : 'Tạo Mới'}
                    </button>
                </div>

            </Modal>
            {/* ── Sub-modals ──────────────────────────────*/}
            {picker === 'lecturePicker' && (
                <LecturePickerModal
                    lectureData={lectureData}
                    selected={form.lectureId}
                    onSave={(id) => {
                        setFieldValue('lectureId', id);
                        setPicker(null)
                    }}
                    onClose={() => setPicker(null)}
                />
            )}
            {picker === 'status' && (
                <StatusPickerModal
                    statusOpts={CLASSES_STATUS_OPTIONS}
                    onClose={() => setPicker(null)}
                    onSelect={(value) => {
                        setFieldValue('status', value);
                        setPicker(null)
                    }}
                    current={form.status}
                />
            )}
            {picker === 'coursePicker' && (
                <CoursePickerModal
                    onClose={() => setPicker(null)}
                    onSave={(courseId) => {
                        setFieldValue('courseId', courseId);
                        setPicker(null)
                    }}
                    selected={form.courseId}
                    courseData={courseData}
                />
            )}
            {picker === 'branchPicker' && (
                <BranchPickerModal
                    onClose={() => setPicker(null)}
                    branchOpts={BRAND_NAME}
                    onSelect={(branch) => {
                        setFieldValue('branch', branch);

                        if (!branch) {
                            setTimeout(() => validateField('branch'), 0);
                        }
                    }}
                    current={form.branch}
                />
            )}
            {picker === 'studentListPicker' && (
                <StudentListPickerModal
                    onClose={() => setPicker(null)}
                    courseId={form?.courseId}
                    classId={editItem?.id || null}
                    selected={form.studentList || []}  // ✅ đọc từ form state
                    onSelect={(ids) => {
                        setFieldValue('studentList', ids); // ✅ ghi vào form state
                        console.log("📌 studentList updated:", ids);
                    }}
                />
            )}
        </>
    )
}
