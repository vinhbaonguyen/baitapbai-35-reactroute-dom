import { formatDateHistory } from "@/utils/date.utils";
import { LECTURE_FIELDS } from "../lecturer/lecture.master.fieldsConfig";
import { COURSE_FIELDS } from "../courses/course.fields";
import { CLASSES_FIELDS } from "../classes/classes.master.fieldsConfig";
import { STUDENTS_FIELDS } from "../students/student.master.fieldsConfig";
import { SCHEDULE_FIELDS } from "../classRoom/classroom.constants";
import { SCORE_FIELDS } from "../score/score.master.fieldsConfig";

export const AUDIT_LOG_COLUMNS = [
    {
        field: 'changedAt',
        label: 'Thời gian',
        type: 'date',
        render: row => formatDateHistory(row.changedAt),
        sortable: true
    },
    {
        field: 'entityType',
        label: 'Loại',
        type: 'text',
        render: row => ENTITY_TYPE_LABELS[row.entityType] || row.entityType,
        sortable: true
    },
    {
        field: 'entityCode',
        label: 'Mã',
        type: 'text',
        render: row => row.entityCode || '-'
    },
    {
        field: 'action',
        label: 'Hành động',
        type: 'badge',        
        render: row => ACTION_BADGE[row.action] || {} ,
        sortable: true,
    },
    {
        field: 'changedBy',
        label: 'Người thực hiện',
        type: 'text',
        render: row => row.changedBy || 'system',
        sortable: false
    }
]

// Derived: SORT_OPTIONS (giống Lecture)
export const SORT_OPTIONS = AUDIT_LOG_COLUMNS
    .filter(col => col.sortable)
    .map(col => ({
        value: col.field,
        label: col.label
    }))

export const ENTITY_TYPE_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: 'lectures', label: 'Giảng viên' },
    { value: 'courses', label: 'Khóa học' },
    { value: 'classes', label: 'Lớp học' },   // bổ sung khi có module Class
    { value: 'students', label: 'Học viên' }, // bổ sung khi có module Student
    { value: 'classSchedules', label: 'Lịch Sắp Lớp'}
]

export const ENTITY_TYPE_LABELS = Object.fromEntries(
    ENTITY_TYPE_OPTIONS.filter(o => o.value).map(o => [o.value, o.label]))

export const ACTION_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: 'CREATE', label: '🟢 Tạo mới' },
    { value: 'UPDATE', label: '🟡 Cập nhật' },
    { value: 'DELETE', label: '🔴 Xóa' },
]

export const ACTION_BADGE = {
    CREATE: { label: 'Tạo mới', color: 'green', icon: '🟢' },
    UPDATE: { label: 'Cập nhật', color: 'orange', icon: '🟡' },
    DELETE: { label: 'Đã xóa', color: 'red', icon: '🔴' },
}

export const PAGE_SIZE = 20;

// // Tra field-config theo entityType để dịch tên field trong Modal chi tiết
// // Course chưa có file config -> [] tạm, HistoryModal tự fallback hiện tên field kỹ thuật (đã patch formatValue ở trên)
export const FIELDS_CONFIG_BY_ENTITY = {
    lectures: LECTURE_FIELDS,
    courses: COURSE_FIELDS,
    classes: CLASSES_FIELDS,
    students: STUDENTS_FIELDS,
    classSchedules: SCHEDULE_FIELDS,
    scores: SCORE_FIELDS

}