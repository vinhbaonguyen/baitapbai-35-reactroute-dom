// Action là 1 object có 2 phần:
// type  → tên hành động (bắt buộc)
// payload → data kèm theo (tuỳ chọn)
// Đặt tên action thành hằng số để tránh typo khi dùng ở nhiều nơi

export const LOGIN = 'LOGIN'
export const LOGOUT = 'LOGOUT'

export const loginAction = (user) => ({
    type: LOGIN,
    payload: user   // object user từ API (không có password)
})

export const logoutAction = () => ({
    type: LOGOUT
    // không cần payload vì logout chỉ cần xóa user
})