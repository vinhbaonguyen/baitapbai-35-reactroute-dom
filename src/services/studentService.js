import { del, get, patch, post, put } from "@/utils/requestAPI"

const PATH = 'students'

// export const getAll = async () => {
//     // 1. Fetch song song
//     const [students, studentCourses] = await Promise.all([
//         get(`${PATH}?_sort=sortOrder&_order=desc`),
//         get(`student-courses`)
//     ])
//     // 2. Merge courseIds vào từng student
//     return students.map(student => {
//         const courseIds = studentCourses
//             .filter(sc => sc.studentId === student.id)
//             .map(sc => Number(sc.courseId))

//         return {...student, courseIds }
//     })
// }



// ✅ Bỏ merge tay student-courses — BE đã trả sẵn courseIds/courseNames/paidSummary
// ✅ Thêm includeCompleted — mặc định false (ẩn sinh viên đã lưu trữ)

export const getAll = async (includeCompleted = true) =>
    get(`${PATH}?includeCompleted=${includeCompleted}`)

export const create = (student) => post(PATH, student)
export const update = (id, data) => put(`${PATH}/${id}`, data)
export const remove = (id) => del(`${PATH}/${id}`)
// 🔥 Hàm mới — lưu trữ sinh viên đã hoàn thành tất cả khóa học
export const archive = (id) => patch(`${PATH}/${id}/archive`)

// export const updateOrder = async (reorderedPageData, startIndex) => {
//     const promises = reorderedPageData.map((item, index) => {
//         return patch(`${PATH}/${item.id}`, { sortOrder: startIndex + index })
//     })
//     return Promise.all(promises)
// }

export const updateOrder = (items) => put(`${PATH}/reorder`, items);