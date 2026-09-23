import { del, get, patch, post, put } from "@/utils/requestAPI";

const PATH = 'scores'

// 1. Lấy tất cả điểm
// export const getAll = () => get(`${PATH}?_sort=sortOrder&_order=asc`);
export const getAll = () => get(PATH);


// 2. Lấy điểm theo class
export const getByClass = (classId) => get(`${PATH}?classId=${classId}&_sort=sortOrder&_order=asc`);

// 3. Lấy điểm theo student
export const getByStudent = (studentId) => get(`${PATH}?studentId=${studentId}&_sort=sortOrder&_order=asc`);

// 4. Tạo điểm mới (ScoreModal sẽ xử lý result + createdAt)
export const create = (score) => post(PATH, score);

//5. Cập nhật điểm (ScoreModal sẽ xử lý result + updatedAt)
export const update = (id, data) => put(`${PATH}/${id}`, data);

//6. Xóa điểm
export const remove = (id) => del(`${PATH}/${id}`);


//7. Cập nhật thứ tự điểm sau khi drag-and-drop
export const updateOrder = async (reorderedPageData, startIndex) => {
    const promises = reorderedPageData.map((item, index) => {
        return patch(`${PATH}/${item.id}`, { sortOrder: startIndex + index })
    })
    return Promise.all(promises)
}