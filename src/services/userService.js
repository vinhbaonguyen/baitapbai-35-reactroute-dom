import { del, get, patch, post } from "../utils/requestAPI"

const PATH = 'users'

export const getAll = () => get(`${PATH}?_sort=sortOrder&_order=asc`)
// Tìm user theo email — json-server hỗ trợ query params
export const findByEmail = (email) => get(`${PATH}?email=${email}`)
// Đổi mật khẩu (dùng cho forgot password)
export const updatePassword = (id, newPassword) => patch(`${PATH}/${id}`, {
    password: newPassword,
    updatedAt: new Date().toISOString()
})

//create ⇒ register — POST /users tạo user mới
export const create = (user) => post(PATH,user)
// Cập nhật — json-server dùng id để update
export const update = (id,data) => patch(`${PATH}/${id}`,data)
export const updateOrder = async (reorderedPageData,startIndex) => {
    // Duyệt qua danh sách các item vừa được kéo thả
    const promises = reorderedPageData.map((item,index)=>{
        return patch(`${PATH}/${item.id}`,{            
            sortOrder:startIndex + index
        })
    })
    // Chờ tất cả các request patch hoàn thành
    return Promise.all(promises)
}
// Xóa
export const remove = (id) => del(`${PATH}/${id}`)