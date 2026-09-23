import React, { useEffect, useRef, useState } from 'react'
import Modal from 'react-modal'
// import { generateClassCode, getClassIndexInMonth } from '@/utils/class.utils';
// import { CLASSES_FIELDS } from '@/constants/classes/classes.fields';
import useForm from '@/hooks/useForm';
import { getModalStyle } from '@/constants/modalStyles';
// import { useSelector } from 'react-redux';
import { alertConfirm, alertError, alertSuccess } from '@/utils/alert';
import FormRenderer from '@/components/FormControls/FormRenderer';
import LecturePickerModal from '@/components/CommonPickers/LecturePickerModal';
import StatusPickerModal from '@/components/CommonPickers/StatusPickerModal';
// import { BRAND_NAME, CLASSES_STATUS_OPTIONS } from '@/constants/classes/classes.constant';
import CoursePickerModal from '@/components/CommonPickers/CoursePickerModal';
import BranchPickerModal from '@/components/CommonPickers/BranchPickerModal';
import StudentListPickerModal from '@/components/CommonPickers/StudentListPickerModal';
import * as studentClassService from '../../services/studentClassService'
// import * as studentCourseService from '@/services/studentCourseService'
import { compareData } from '@/utils/compareData';
import Draggable from 'react-draggable';
import useLookupMaps from '@/hooks/useLookupMap';
import { useDispatch, useSelector } from 'react-redux';
import { selectCourses, selectLectures, selectStudentCourse, selectStudents } from '@/store/selectors/masterDataSelectors';
import { BRAND_NAME, CLASSES_FIELDS, CLASSES_STATUS_OPTIONS } from '@/constants/classes/classes.master.fieldsConfig';
import { updateMasterEntity } from '@/actions/masterDataAction';
// Hàm tạo Mã ClassCode
// const generateClassCodeForClass = (courseName, allClasses, branch) => {
//     const index = getClassIndexInMonth(allClasses);
//     return generateClassCode({ courseName, branch, index });
// };
export default function ClassModal({
    editItem,
    onSave,
    onClose,
    onWriteLog,     // ✅ thêm prop này — callback ghi history từ Class.jsx
    allClasses = [],
    initialCourseId = null,
    initialLectureId = null
}) {
    const isEdit = !!editItem;
    // console.log("Giá Trị 1 Object Class được chọn để Edit", editItem);

    const [picker, setPicker] = useState(null);
    //state quản lý enable hay unenable cho StudentListPickerModal
    const [isStudentPickerEnabled, setIsStudentPickerEnabled] = useState(() => editItem ? true : false)

    const dispatch = useDispatch();


    // ✅ enrichedEditItem: editItem + studentList từ student_class
    // Cần để compareData so sánh đúng: formData.studentList vs editItem.studentList
    // const [enrichedEditItem, setEnrichedEditItem] = useState(editItem);

    const courseData = useSelector(selectCourses);
    const lectureData = useSelector(selectLectures);
    const studentData = useSelector(selectStudents);
    const studentCourse = useSelector(selectStudentCourse)

    // ✅ Load studentList đã assign khi mở EDIT ⇒ enrichedEditItem   
    // useEffect(() => {
    //     console.log("📌 studentCourse hiện tại:", studentCourse);   // debug tạm
    //     console.log("Edit Item Data ", editItem);

    //     // CREATE mode: : không cần enrich
    //     if (!editItem?.id) { setEnrichedEditItem(editItem); return; }
    //     // Update Mode (Edit)
    //     studentClassService.getByClassId(editItem.id)
    //         .then(list => {
    //             // Lấy tất cả studentId từ DB               
    //             const rawIds = list.map(sc => sc.studentId);

    //             // Lọc bỏ những student có status = 'Completed' trong master studentData

    //             const filtedRawIds = rawIds.filter(id => {
    //                 const student = studentData.find(s => s.id === id)
    //                 return !student || student.status !== 'Completed'
    //             })
    //             setEnrichedEditItem({ ...editItem, studentList: filtedRawIds });
    //         })
    // }, [editItem, studentCourse, studentData]);

    // Step 2: Sync studentList vào form khi enrichedEditItem load xong   
    // useRef đảm bảo chỉ chạy 1 lần (tránh loop)
    // const hasInitStudents = useRef(false);
    // useEffect(() => {
    //     if (!enrichedEditItem?.studentList || hasInitStudents.current) return;
    //     setFieldValue('studentList', enrichedEditItem.studentList);
    //     hasInitStudents.current = true;
    //     console.log("📌 form.studentList synced:", enrichedEditItem.studentList);
    // }, [enrichedEditItem]);

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
            fields: CLASSES_FIELDS,
            // editItem: enrichedEditItem,    // ✅ dùng enrichedEditItem thay vì editItem
            editItem: editItem,
            dependencies: { allClasses, courseData },
            onFieldsChange: (name, value, currentForm, deps) => {
                let updatedForm = { ...currentForm };
                // ===== AUTO-GENERATE CLASS CODE =====
                // ✅ Chỉ generate khi user thay đổi courseId HOẶC branch               
                // if (name === 'courseId' || name === 'branch') {
                //     const courseId = name === 'courseId' ? value : currentForm.courseId;
                //     const branch = name === 'branch' ? value : currentForm.branch;

                //     if (courseId && branch) {
                //         const course = deps.courseData.find(c => Number(c.id) === Number(courseId));
                //         if (course) {
                //             // Lọc đúng danh sách lớp theo courseId và branch
                //             const classesOfCourse = deps.allClasses.filter(c =>
                //                 Number(c.courseId) === Number(courseId) && c.branch === branch);

                //             const code = generateClassCodeForClass(course.courseName, classesOfCourse, branch);

                //             // ✅ ĐÚNG: gán thẳng vào updatedForm rồi return
                //             updatedForm.classCode = code;
                //         }
                //     }
                //     // Nếu xóa courseId hoặc branch → xóa classCode
                //     if (!courseId || !branch) updatedForm.classCode = ''
                // }
                // ===== AUTO-FILL DESCRIPTION THEO COURSE =====
                // --- reset lại studentList,classNumber khi chọn courseId khác trong ClassModal
                if (name === 'courseId') {
                    const selectedCourse = deps.courseData.find(c => Number(c.id) === Number(value));
                    console.log('selectedCourse:', selectedCourse); // null = vẫn lỗi, object = đúng rồi
                    // updatedForm.description = selectedCourse?.category || '';
                    updatedForm.studentList = [];
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
        }
    );

    // ✅ STEP 3: handleSubmit
    // compareData bên trong onSave đã so sánh studentList tự động
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        // ✅ Khi Edit, bỏ qua validate cho courseId/brand vì 2 field này bị khóa, không cho sửa

        const error = validate(isEdit ? ['courseId', 'brand'] : []);
        if (error) { alertError({ title: `Vui Lòng Nhập "${error}"` }); return; }

        // 🔥 Bắt buộc dọn sạch dirty data trước khi cho lưu — phòng trường hợp
        // user không mở lại "Chọn Học Viên" sau khi dirty đã tồn tại sẵn

        const invalidStudents = (form.studentList || [])
            .filter(id => !studentCourse.some(sc =>
                Number(sc.studentId) === Number(id) && Number(sc.courseId) === Number(form.courseId)))
            .map(id => studentData.find(s => Number(s.id) === Number(id))?.studentName)
            .filter(Boolean);

        const completedStudents = (form.studentList || [])
            .map(id => studentData.find(s => Number(s.id) === Number(id)))
            .filter(s => s?.status === 'Completed')
            .map(s => s.studentName);

        if (invalidStudents.length > 0) {
            alertError({
                title: 'Danh sách sinh viên đang có dữ liệu không hợp lệ',
                text: `Vui lòng mở "Chọn Học Viên" để gỡ: ${invalidStudents.join(', ')}`
            })
            return;
        }

        if (completedStudents.length > 0) {
            alertError({
                title: 'Danh sách sinh viên có học viên đã kết thúc',
                text: `Vui lòng mở "Chọn Học Viên" để gỡ: ${completedStudents.join(', ')}`
            })
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
                    editItem: editItem,
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
                try {
                    // ✅ Assign students
                    // await studentClassService.assignStudents(editItem.id, form.studentList || []);
                    const synced = await studentClassService.syncStudents(editItem.id, form.studentList || []);
                    dispatch(updateMasterEntity('studentClass', 'replaceByKey', {
                        key: 'classId',
                        value: editItem.id,
                        items: synced
                    }))
                } catch (err) {
                    // console.warn("⚠️ Assign students thất bại (StudentClass BE chưa sẵn sàng, bỏ qua tạm):", err);
                    alertError({
                        title: 'Đồng bộ sinh viên trong lớp thất bại',
                        text: err.message || 'Vui lòng thử lại.'
                    });
                }

                // ✅ Ghi history — truyền changedFields đầy đủ bao gồm studentList
                if (onWriteLog) {
                    await onWriteLog(
                        'UPDATE',
                        { ...savedResult, studentList: form.studentList || [] }, // newItem
                        editItem, // có studentList gốc để so sánh,                       
                    );
                    console.log("✅ writeLog EDIT:", changedFields);

                }
                alertSuccess({ title: 'Cập Nhật Thành Công' });
                onClose();

            } else {
                // CREATE: gọi onSave → lấy id mới → assign students
                const savedClass = await onSave(getSubmitData());
                if (!savedClass?.id) return;
                try {
                    if (form.studentList?.length > 0) {
                        // await studentClassService.assignStudents(savedClass.id, form.studentList)
                        const synced = await studentClassService.syncStudents(savedClass.id, form.studentList);
                        dispatch(updateMasterEntity('studentClass', 'replaceByKey', {
                            key: 'classId',
                            value: savedClass.id,
                            items: synced
                        }));
                    }
                } catch (error) {
                    // console.warn("⚠️ Assign students thất bại (StudentClass BE chưa sẵn sàng, bỏ qua tạm):", error);
                    alertError({
                        title: '⚠️ Đồng bộ sinh viên trong lớp thất bại',
                        text: error.message || 'Vui lòng thử lại.'
                    });
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
    // const studentMap = useLookupMaps(studentData, 'id', 'studentName')
    // 🔥 Map riêng CHỈ để hiển thị field "Danh Sách Học Viên" — loại tên SV Completed
    // khỏi phần text hiển thị, KHÔNG đụng gì tới studentData gốc (invalidStudents guard
    // vẫn cần tìm được tên SV Completed để hiện đúng thông báo lỗi nếu có dirty data)
    const activeStudentMap = useLookupMaps(
        studentData.filter(s => s.status !== 'Completed'),
        'id', 'studentName'
    )
    // console.log("Giá Trị của studentMap", studentMap);
    const lookUpMaps = {
        courseId: courseMap,
        lectureId: lectureMap,
        studentList: activeStudentMap
    }

    const nodeRef = useRef(null);


    // ⭐ Auto-fill courseId khi mở modal từ navigate
    const hasAppliedInitialCourse = useRef(false);
    useEffect(() => {
        if (isEdit) return;                     // chỉ CREATE
        if (!initialCourseId) return;           // không có courseId thì bỏ qua
        if (hasAppliedInitialCourse.current) return;

        setFieldValue("courseId", Number(initialCourseId));
        hasAppliedInitialCourse.current = true;
        // courseId đã được set → bật StudentPicker
        setIsStudentPickerEnabled(true)
        console.log("📌 StudentPicker enabled do initialCourseId:", initialCourseId)

        console.log("📌 Auto-fill courseId:", initialCourseId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialCourseId, isEdit]);

    // ⭐ Auto-fill lectureId khi mở modal từ navigate
    const hasAppliedInitialLecture = useRef(false);
    useEffect(() => {
        if (isEdit) return;                     // chỉ CREATE
        if (!initialLectureId) return;          // không có lectureId thì bỏ qua
        if (hasAppliedInitialLecture.current) return;

        setFieldValue("lectureId", Number(initialLectureId));

        hasAppliedInitialLecture.current = true;

        console.log("📌 Auto-fill lectureId:", initialLectureId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLectureId, isEdit]);


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
                {/* ======= TẤT CẢ NỘI DUNG MODAL Ở ĐÂY ======= */}
                <h4 className="modal__header">
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
                    extraDisabled={{
                        studentList: !isStudentPickerEnabled,
                        courseId: isEdit, // ✅ khóa courseId khi edit
                        brand: isEdit,  // ✅ khóa branch khi edit
                    }}
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
                        validateField('lectureId')
                        setPicker(null)
                    }}
                    onEmptyConfirm={() => {
                        setFieldValue('lectureId', '');
                        validateField('lectureId');
                        setPicker(null)
                    }}
                    onClose={() => setPicker(null)}
                />
            )}
            {picker === 'status' && (
                <StatusPickerModal
                    statusOpts={CLASSES_STATUS_OPTIONS}
                    onClose={() => setPicker(null)}
                    onSave={(value) => {
                        setFieldValue('status', value);
                        validateField('status')
                        setPicker(null)
                    }}
                    onEmptyConfirm={() => {
                        setFieldValue('status', '')
                        validateField('status')
                        setPicker(null)
                    }}
                    selected={form.status ?? ''}
                />
            )}
            {picker === 'coursePicker' && (
                <CoursePickerModal
                    courseData={courseData}
                    selected={form.courseId}
                    singleSelect={true}
                    onSave={(courseIds) => {
                        // CoursePickerModal LUÔN trả về mảng, kể cả ở chế độ singleSelect
                        // -> unwrap lấy phần tử đầu tiên
                        const courseId = courseIds[0];
                        setFieldValue('courseId', courseId);
                        validateField('courseId')
                        setPicker(null)
                    }}
                    onClose={() => setPicker(null)}
                    onEmptyConfirm={() => {
                        setFieldValue('courseId', '')
                        validateField('courseId')
                        setPicker(null)
                    }}
                />
            )}
            {picker === 'branchPicker' && (
                <BranchPickerModal
                    selected={form.brand}
                    branchOpts={BRAND_NAME}
                    onSave={(brand) => {
                        setFieldValue('brand', brand);
                        validateField('brand')
                        setPicker(null)

                        if (!brand) {
                            setTimeout(() => validateField('brand'), 0);
                        }
                    }}
                    onClose={() => setPicker(null)}
                    onEmptyConfirm={() => {
                        setFieldValue('brand', '')
                        validateField('brand')
                        setPicker(null)
                    }}
                />
            )}
            {picker === 'studentListPicker' && (
                <StudentListPickerModal
                    onClose={() => setPicker(null)}
                    // courseId={form?.courseId}
                    // ✅ Ưu tiên initialCourseId nếu form.courseId chưa có
                    courseId={form?.courseId || initialCourseId}
                    classId={editItem?.id || null}
                    studentCourse={studentCourse}
                    selected={form.studentList || []}  // ✅ đọc từ form state
                    onSelect={(ids) => {
                        setFieldValue('studentList', ids); // ✅ ghi vào form state
                        // console.log("📌 studentList updated:", ids);
                    }}
                />
            )}
        </>
    )
}
