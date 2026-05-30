import { del, get, patch, post } from "../utils/requestAPI"

const PATH = 'courses'

// Lấy tất cả courses
export const getAll = () => get(`${PATH}?_sort=sortOrder&_order=asc`)


// Thêm mới
export const create = (data) => post(PATH, data)

// Cập nhật — json-server dùng id để update
export const update = (id, data) => patch(`${PATH}/${id}`, data)
// Cập nhật order của các item sau khi USER thay đổi vị trí bằng cách Drag và Drop
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