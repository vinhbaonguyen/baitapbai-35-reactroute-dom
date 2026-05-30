import { del, get, patch, post } from "@/utils/requestAPI"


const PATH = 'student_course'

// Lấy danh sách khóa học mà student đã đăng ký
export const getByStudent = (studentId) => get(`${PATH}?studentId=${studentId}`)
// ✅ Lấy danh sách student_course theo courseId
export const getByCourse = (courseId) => get(`${PATH}?courseId=${courseId}`)
// Tạo đăng ký khóa học mới
export const create = (studentId, courseId) =>
    post(PATH, {
        studentId,
        courseId,
        registeredAt: new Date().toISOString()
    })
// Cập nhật đăng ký khóa học
export const update = (id, courseId) =>
    patch(`${PATH}/${id}`, {
        courseId,
        registeredAt: new Date().toISOString()
    })

// Xóa đăng ký khóa học
export const remove = (id) =>
    del(`${PATH}/${id}`)