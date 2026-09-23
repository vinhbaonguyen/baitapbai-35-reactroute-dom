import { del, get, post, patch} from "@/utils/requestAPI"

// const PATH = 'student_course'
const PATH = 'student-courses'

// export const getAll = () => get(`${PATH}?_sort=sortOrder&_order=asc`)
export const getAll = () => get(PATH)
// Lấy danh sách khóa học mà student đã đăng ký
export const getByStudent = (studentId) => get(`${PATH}?studentId=${studentId}`)

// ✅ Lấy danh sách student_course theo courseId
export const getByCourse = (courseId) => get(`${PATH}?courseId=${courseId}`)

// Tạo đăng ký khóa học mới
export const create = (studentId, courseId,hasPaidFee=false) =>
    post(PATH, {studentId,courseId,hasPaidFee })
// Cập nhật đăng ký khóa học → Bỏ hẳn vì BE không còn hỗ trợ (lý do đã giải thích ở trên)

// export const update = (id, courseId) =>
//     put(`${PATH}/${id}`, {
//         courseId,
//         registeredAt: new Date().toISOString()
//     })

// Xóa đăng ký khóa học
export const remove = (id) => del(`${PATH}/${id}`)

// Cập nhật trạng thái đã đóng học phí

export const updatePaidFee = (id, hasPaidFee) =>
    patch(`${PATH}/${id}`, { hasPaidFee })