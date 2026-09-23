import { getModalStyle } from '@/constants/modalStyles'
import useForm from '@/hooks/useForm';
import { selectClasses, selectClassSchedules, selectCourses, selectStudents } from '@/store/selectors/masterDataSelectors';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Modal from 'react-modal'
import { useSelector } from 'react-redux';
import * as studentClassService from '@/services/studentClassService'
import { alertError } from '@/utils/alert';
import Draggable from 'react-draggable';
import FormRenderer from '@/components/FormControls/FormRenderer';
import useLookupMaps from '@/hooks/useLookupMap';
import ClassPickerModal from '@/components/CommonPickers/ClassPickerModal';
import ScoreStudentPickerModal from '@/components/CommonPickers/ScoreStudentPickerModal';
import { SCORE_FIELDS } from '@/constants/score/score.master.fieldsConfig';

// ── Giữ nguyên hàm tính kết quả gốc ──
// ========== HELPER ==========
// Hàm này dùng khi nhập điểm thi Có dùng được hàm applyResultCalculation trong ScoreService.java ??
const calculateResult = (score1, score2) => {
    const s1 = score1 !== '' && score1 !== null && score1 !== undefined ? Number(score1) : null;
    const s2 = score2 !== '' && score2 !== null && score2 !== undefined ? Number(score2) : null;
    if (s1 === null) return '';
    if (s1 >= 50) return 'Pass';
    // s1 < 5
    if (s2 === null) return 'Pending';
    if (s2 >= 50) return 'Pass';
    return 'Fail';
}

export default function ScoreModal({ editItem, onClose, onSave, existingScores = [] }) {
    const nodeRef = useRef(null);
    const [picker, setPicker] = useState(null);

    // ── LOAD MASTER DATA (giữ nguyên) ──
    const students = useSelector(selectStudents);
    const courses = useSelector(selectCourses);
    const classes = useSelector(selectClasses);
    const classSchedules = useSelector(selectClassSchedules);

    const isEdit = !!editItem;
    // ── Tính trạng thái lock theo từng case ──
    const result = editItem?.result;
    const hasCert = editItem?.certificateIssued;
    // Pass + đã cấp chứng chỉ  → lock TOÀN BỘ (không cho sửa gì nữa)
    // Fail                      → lock TOÀN BỘ (kể cả certificateIssued)
    const isFullyLocked = isEdit && (
        (result === 'Pass' && hasCert === true) ||
        (result == 'Fail')
    );
    // Pass + chưa cấp chứng chỉ → chỉ lock các field khác, CHỈ cho sửa certificateIssued
    const isPartiallyLocked = isEdit && result === 'Pass' && hasCert === false;
    // isLocked dùng để hiện banner cảnh báo
    const isLocked = isFullyLocked || isPartiallyLocked;
    // Tính extraDisabled truyền vào FormRenderer
    // Tạo object extraDisabled: tất cả field đều true, ngoại trừ certificateIssued
    // Cách hoạt động: FormRenderer đọc extraDisabled[fieldName] → true → disabled
    // ── CUSTOMIZE LOGIC KHÓA FIELD TẠI ĐÂY ──
    const lockedFields = (() => {
        // Trường hợp 1: Form bị khóa hoàn toàn (Pass + đã cấp CC, hoặc Fail)
        if (isFullyLocked) {
            // Lock TẤT CẢ field — không ngoại trừ ai
            return SCORE_FIELDS.reduce((acc, field) => {
                acc[field.name] = true;
                return acc;
            }, {});
        }
        // Trường hợp 2: Pass nhưng chưa cấp chứng chỉ -> Chỉ cho sửa duy nhất certificateIssued
        if (isPartiallyLocked) {
            return SCORE_FIELDS.reduce((acc, field) => {
                acc[field.name] = field.name !== 'certificateIssued';
                return acc
            }, {});
        }
        // Trường hợp 3: Chế độ EDIT thông thường (Ví dụ: Trạng thái 'Pending' - mới có điểm lần 1 chờ lần 2)
        // Yêu cầu: Khóa cố định 3 field Mã học viên, Khóa học, Lớp học. Các trường nhập điểm vẫn mở.
        if (isEdit) {
            return SCORE_FIELDS.reduce((acc, field) => {
                acc[field.name] = ['studentId', 'classId', 'courseId'].includes(field.name);
                return acc;
            }, {});
        }
        return {}; // Pending hoặc CREATE → không lock gì
    })();

    // Thêm tạm vào ScoreModal, ngay dưới dòng const isLocked = ...
    // console.log('🔍 editItem.result =', editItem?.result);
    // console.log('🔍 isLocked =', isLocked);
    // console.log('🔍 lockedFields =', lockedFields);
    console.log('Data của Score ', existingScores);

    // ── LOAD student_class ──
    // Thêm ref để onFieldsChange luôn đọc data mới nhất (tránh stale closure)
    // Lý do: studentClass load async, lúc useCallback khởi tạo nó vẫn là []
    // Ref không bị capture bởi closure nên luôn có giá trị đúng
    const [studentClass, setStudentClass] = useState([]);
    const studentClassRef = useRef([]);

    useEffect(() => {
        studentClassService.getAll().then(data => {
            setStudentClass(data);
            studentClassRef.current = data; // ← cập nhật ref song song với state
        });
    }, []);
    // ── Lookup maps (giữ nguyên) ──
    const courseMap = useLookupMaps(courses, 'id', 'courseName')
    const classMap = useLookupMaps(classes, 'id', 'classCode')
    const studentMap = useLookupMaps(students, 'id', 'studentName')
    const lookUpMaps = {
        courseId: courseMap,
        classId: classMap,
        studentId: studentMap
    };

    // ── Map studentId -> Set(courseId) đã có Score (bất kể result gì, vì BE chặn theo course) ──

    //-----------------------------------------------------------------
    const scoredCourseByStudent = useMemo(() => {
        const map = {};
        existingScores.forEach(s => {
            const cls = classes.find(c => Number(c.id) === Number(s.classId));
            if (!cls?.courseId) return;
            const key = Number(s.studentId);
            if (!map[key]) map[key] = new Set();
            map[key].add(Number(cls.courseId));
        });
        return map;
    }, [existingScores, classes]);

    // Ref để onFieldsChange (closure cũ) luôn đọc được data mới nhất — cùng pattern với studentClassRef
    const scoredCourseByStudentRef = useRef({});
    useEffect(() => {
        scoredCourseByStudentRef.current = scoredCourseByStudent;
    }, [scoredCourseByStudent]);
    //------------------------------------------------------------------------------

    // const availableStudentsForPicker = useMemo(() => {
    //     // Nếu là chế độ EDIT: Chỉ cho phép chọn chính học viên đó, không cho đổi sang người khác
    //     if (isEdit && editItem?.studentId) {
    //         return students.filter(s => Number(s.id) === Number(editItem.studentId));
    //     }

    //     // Nếu là chế độ CREATE: Áp dụng các bộ lọc nghiêm ngặt
    //     // Bước a: Lấy tập hợp các StudentId đã có điểm để loại trừ
    //     const excludeSet = new Set(
    //         existingScores
    //             .filter(s => s.result === 'Pass' || s.result === 'Fail' || s.result === 'Pending')
    //             .map(s => Number(s.studentId))
    //     );

    //     // Bước b: Lấy tập hợp các ClassId đã có lịch học
    //     const classIdsWithSchedule = new Set(classSchedules.map(sc => Number(sc.classId)));

    //     // Bước c: Lấy tập hợp các StudentId thỏa mãn đã xếp vào lớp có lịch
    //     const scheduledStudentIds = new Set(
    //         studentClass
    //             .filter(sc => classIdsWithSchedule.has(Number(sc.classId)))
    //             .map(sc => Number(sc.studentId))
    //     );

    //     // Bước d: Lọc danh sách master data cuối cùng
    //     return students.filter(s =>
    //         scheduledStudentIds.has(Number(s.id)) &&
    //         !excludeSet.has(Number(s.id)) &&
    //         s.status !== 'Completed'
    //     );
    // }, [students, classSchedules, studentClass, existingScores, isEdit, editItem]);

    const availableStudentsForPicker = useMemo(() => {
        // EDIT MODE → chỉ cho chọn đúng student đó
        if (isEdit && editItem?.studentId) {
            return students.filter(s => Number(s.id) === Number(editItem.studentId));
        }
        // CREATE MODE
        // 1. Loại student đã có score ở tất cả course họ đăng ký
        const excludeSet = new Set(
            students
                .filter(s => {
                    const registeredCourseIds = studentClass
                        .filter(sc => Number(sc.studentId) === Number(s.id))
                        .map(sc => classes.find(cl => Number(cl.id) === Number(sc.classId)))
                        .filter(Boolean)
                        .map(cl => cl.courseId);

                    if (registeredCourseIds.length === 0) return false;

                    const scoredSet = scoredCourseByStudent[s.id] || new Set();
                    return registeredCourseIds.every(cid => scoredSet.has(cid));
                })
                .map(s => Number(s.id))
        );
        console.log("Danh sách sinh viên đã có Score :", excludeSet);

        // 2. Lấy student đã xếp vào lớp có lịch
        const classIdsWithSchedule = new Set(classSchedules.map(sc => Number(sc.classId)));

        const scheduledStudentIds = new Set(
            studentClass
                .filter(sc => classIdsWithSchedule.has(Number(sc.classId)))
                .map(sc => Number(sc.studentId))
        );

        // 3. Lọc cuối
        return students.filter(s =>
            scheduledStudentIds.has(Number(s.id)) &&
            !excludeSet.has(Number(s.id)) &&
            s.status !== 'Completed'
        );

    }, [
        students,
        classes,
        classSchedules,
        studentClass,
        scoredCourseByStudent,
        existingScores,
        isEdit,
        editItem
    ]);

    console.log("Danh sách SV chưa có Score ", availableStudentsForPicker);


    const {
        form, setForm, errors,
        onChange, handleBlur,
        setFieldValue, validate,
        validateField, getSubmitData
    } = useForm({
        fields: SCORE_FIELDS,
        editItem,
        // studentClass không truyền vào deps nữa vì đọc qua ref bên dưới
        dependencies: { students, courses, classes },
        onFieldsChange: (name, value, currentForm, deps) => {
            let updatedForm = { ...currentForm };
            if (name === 'studentId') {
                const student = deps.students.find(s => Number(s.id) === Number(value));
                if (!student) return updatedForm;

                updatedForm.studentName = student.studentName || '';

                const registeredClassId = studentClassRef.current
                    .filter(sc => Number(sc.studentId) === Number(student.id))
                    .map(sc => sc.classId);

                if (!student.courseIds || student.courseIds.length === 0) {
                    alertError({ title: 'Học viên chưa đăng ký khóa học nào!' })
                    updatedForm.studentId = '';
                    updatedForm.studentName = '';
                    return updatedForm;
                }

                if (registeredClassId.length === 0) {
                    alertError({ title: 'Học viên chưa đăng ký lớp học nào!' })
                    updatedForm.studentId = '';
                    updatedForm.studentName = '';
                    return updatedForm;
                }
                const scoredCourseIds = scoredCourseByStudentRef.current[student.id] || new Set();
                updatedForm.classOptions = deps.classes.filter(cl =>
                    registeredClassId.includes(cl.id) && !scoredCourseIds.has(Number(cl.courseId))
                );
                updatedForm.classId = '';
                updatedForm.courseId = '';
                // updatedForm.courseName = ''; → courseName không có trong SCORE_FIELDS
                return updatedForm
            }

            // ── Khi chọn classId (giữ nguyên logic gốc) ──
            if (name === 'classId') {
                const validOptions = currentForm.classOptions || [];
                const isValid = validOptions.some(cl => Number(cl.id) === Number(value));
                // ✅ Chỉ validate khi CREATE, không reset khi EDIT
                if (!isValid && value && !editItem) {
                    alertError({ title: 'Lớp học không hợp lệ với học viên này!' });
                    updatedForm.classId = '';
                    return updatedForm;
                }
                // ✅ Từ class → suy ra course
                const selectedClass = validOptions.find(cl => Number(cl.id) === Number(value));
                if (selectedClass) {
                    const course = deps.courses.find(c => Number(c.id) === Number(selectedClass.courseId));
                    updatedForm.classCode = selectedClass.classCode || '';
                    updatedForm.courseId = selectedClass.courseId;
                    updatedForm.courseName = course?.courseName || '';
                }

                return updatedForm;
            }

            // ── Khi nhập điểm (giữ nguyên logic gốc) ──
            if (name === 'scoreAtFirstTime' || name === 'scoreAtSecondTime') {
                const s1 = name === 'scoreAtFirstTime' ? value : currentForm.scoreAtFirstTime;
                const s2 = name === 'scoreAtSecondTime' ? value : currentForm.scoreAtSecondTime;
                updatedForm.finalScore = Math.max(Number(s1 || 0), Number(s2 || 0));
                updatedForm.result = calculateResult(s1, s2);
                if (updatedForm.result !== 'Pass') {
                    updatedForm.certificateIssued = false;
                }
            }
            return updatedForm
        }
    });

    // ── Giữ nguyên handleSubmit gốc ──
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const errorField = validate();
        if (errorField) {
            alertError({ title: `Vui lòng kiểm tra lại "${errorField}"` })
            return;
        }
        const submitData = getSubmitData();
        await onSave(submitData);
    }

    return (
        <>
            <Modal
                isOpen={true}
                onRequestClose={onClose}
                style={getModalStyle('520px')}
                shouldFocusAfterRender={true}
                shouldReturnFocusAfterClose={true}
                ariaHideApp={false}
                contentElement={(props, children) => (
                    <Draggable
                        handle='.modal__title'
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
                <h4 className="modal__title">
                    {isEdit ? '✏️ Sửa Điểm Cuối Khóa' : '➕ Thêm Điểm Cuối Khóa'}
                </h4>
                {/* ← THÊM ĐOẠN NÀY */}
                {isLocked && (
                    <div className={`modal__warning-box ${isFullyLocked
                        ? 'modal__warning-box--locked'
                        : 'modal__warning-box--pending'}`}>
                        {isFullyLocked && result === 'Pass' && (
                            // Pass + đã cấp chứng chỉ
                            <>🔒 Học viên đã <strong>Pass</strong> và đã được cấp chứng chỉ. Form bị khóa hoàn toàn.</>
                        )}
                        {isFullyLocked && result === 'Fail' && (
                            // Fail → lock toàn bộ
                            <>🔒 Học viên có kết quả <strong>Fail</strong>. Form bị khóa hoàn toàn.</>
                        )}
                        {isPartiallyLocked && (
                            // Pass + chưa cấp chứng chỉ
                            <>⚠️ Học viên đã <strong>Pass</strong>. Chỉ có thể cập nhật <strong>Chứng chỉ</strong>.</>
                        )}
                    </div>
                )}
                <FormRenderer
                    fields={SCORE_FIELDS}
                    form={form}
                    errors={errors}
                    onChange={onChange}
                    handleBlur={handleBlur}
                    validateField={validateField}
                    editItem={editItem}
                    layout="horizontal"
                    setPicker={setPicker}
                    displayMaps={lookUpMaps}
                    extraDisabled={lockedFields}
                />

                <div className="modal__footer">
                    <button className="btn btn--outline" onClick={onClose}>
                        Hủy
                    </button>
                    <button className="btn btn--primary" onClick={handleSubmit}>
                        {isEdit ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                </div>
            </Modal>

            {/* Picker 1: Chọn học viên (giữ nguyên) */}
            {picker === 'studentPicker' && (
                <ScoreStudentPickerModal
                    onClose={() => setPicker(null)}
                    selected={form.studentId ? Number(form.studentId) : null}                   
                    studentsData={availableStudentsForPicker}
                    onSelect={(selectedId) => {
                        console.log('[ScoreModal] nhận được selectedId =', selectedId);
                        if (selectedId) {
                            setFieldValue('studentId', selectedId);
                            validateField('studentName');   // ← THÊM: clear lỗi cũ trên field hiển thị
                        }
                        setPicker(null)
                    }}
                />
            )}

            {/* Picker 2: Chọn lớp học */}
            {picker === 'classPicker' && (
                <ClassPickerModal
                    preFilteredData={form.classOptions || []}
                    selected={form.classId ? [form.classId] : []}
                    singleSelect={true}
                    onSave={(pickedIds) => {
                        if (pickedIds[0]) {
                            // onChange({ target: { name: 'classId', value: pickedIds[0] } })
                            setFieldValue('classId', pickedIds[0])
                            validateField('classCode')
                        }
                        setPicker(null)
                    }}
                    onClose={() => setPicker(null)}
                />
            )}
        </>
    )
}