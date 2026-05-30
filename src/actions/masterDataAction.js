// ================================================================
// Định nghĩa action types và action creators cho master data
// Master data = dữ liệu ít thay đổi, dùng chung nhiều nơi

// ================================================================
// Đặt tên action thành hằng số để tránh typo khi dùng ở nhiều nơi
export const SET_MASTER_DATA = 'SET_MASTER_DATA';
export const UPDATE_MASTER_ENTITY = 'UPDATE_MASTER_ENTITY';
// ================================================================
// Action là 1 object có 2 phần:
// type  → tên hành động (bắt buộc)
// payload → data kèm theo (tuỳ chọn)

export const setMasterData = (payload) => ({
    type: SET_MASTER_DATA,
    payload
})
// payload : @param {Object} - { courses?, lectures?, students? ,..}
// mỗi khi dispath : dispatch(setMasterData(courses:[...]))

export const updateMasterEntity = (entity, action, item) => ({
    type: UPDATE_MASTER_ENTITY,
    payload: { entity, action, item }
})
//@param {string} entity   - 'courses' | 'lectures' | 'students'
//@param {string} action   - 'create' | 'update' | 'delete'
//@param {Object} item     - item vừa được create/update/delete