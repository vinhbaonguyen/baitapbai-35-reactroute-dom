import { del, get, patch, post } from "@/utils/requestAPI";


const PATH = 'student_class';
// Lấy record theo studentId (1 student = 1 record)
export const getByStudentId = (studentId) => get(`${PATH}?studentId=${studentId}`)
// Lấy danh sách student trong class
export const getByClassId = (classId) => get(`${PATH}?classId=${classId}`)
// Tạo record mới
export const create = (data) => post(PATH, data)
// Xóa record
export const remove = (id) => del(`${PATH}/${id}`)
// Cập nhật record (chuyển lớp)
export const update = (id, data) => patch(`${PATH}/${id}`, data)
/*  
===========================================================
🟦 assignStudents(classId, studentIds)
→ Hàm QUAN TRỌNG NHẤT
→ Dùng khi bấm Save trong StudentListPickerModal
→ Xóa danh sách cũ → thêm danh sách mới
===========================================================
*/
export const assignStudents = async (classId, studentIds = []) => {
    const existingStudents = await getByClassId(classId);
    for (const sc of existingStudents) {
        await remove(sc.id);
    }
    for (const studentId of studentIds) {
        await create({
            studentId,
            classId,
            jointedAt: new Date().toISOString()
        });
    }
    return true;
}