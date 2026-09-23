import { del, get, post, put } from "../utils/requestAPI"


const PATH = 'classes'
// Lấy tất cả class (dùng cho DataTable)
// export const getAll = () => get(`${PATH}?_sort=sortOrder&_order=asc`)
export const getAll = () => get(`${PATH}?_sort=id&_order=asc`)

// Lấy class theo id
export const getById = (id) => get(`${PATH}/${id}`)
// Lấy class theo courseId (dùng trong ClassModal)
export const getByCourseId = (courseId) =>
    get(`${PATH}?courseId=${courseId}&_sort=id&_order=asc`)
// Tạo class mới
export const create = (data) => post(PATH, data)
// Cập nhật class
export const update = (id,data) => put(`${PATH}/${id}`,data)
// Xóa class
export const remove = (id) => del(`${PATH}/${id}`)
// Thay đổi bằng cách kéo và thả trong TableData
// export const updateOrder = async (reorderedPageData, startIndex) => {
//     const promises = reorderedPageData.map((item, index) => {
//         return patch(`${PATH}/reorder/${item.id}`, { sortOrder: startIndex + index })
//     })
//     return Promise.all(promises)
// }

export const updateOrder = (items) => put(`${PATH}/reorder`, items)
