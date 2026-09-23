import { del, get, patch, post } from "../utils/requestAPI"


// Phần code này dùng cho Json-Server
const PATH = 'users'

export const getAll = () => get(`${PATH}?_sort=sortOrder&_order=asc`)
// Tìm user theo email — json-server hỗ trợ query params
export const findByEmail = (email) => get(`${PATH}?email=${email}`)
// Đổi mật khẩu (dùng cho forgot password)
export const updatePassword = (id, newPassword) => patch(`${PATH}/${id}`, {
    password: newPassword,
    updatedAt: new Date().toISOString()
})

// Phần code này dùng cho Java

//create ⇒ register — POST /users tạo user mới
export const create = (user) => post(PATH, user)
// Cập nhật — json-server dùng id để update
export const update = (id, data) => patch(`${PATH}/${id}`, data)
export const updateOrder = async (reorderedPageData, startIndex) => {
    // Duyệt qua danh sách các item vừa được kéo thả
    const promises = reorderedPageData.map((item, index) => {
        return patch(`${PATH}/${item.id}`, {
            sortOrder: startIndex + index
        })
    })
    // Chờ tất cả các request patch hoàn thành
    return Promise.all(promises)
}
// Xóa
export const remove = (id) => del(`${PATH}/${id}`)

// ============================================
// 👇 CÁC HÀM MỚI — luồng quên mật khẩu qua OTP + Java Backend
// Lưu ý: 3 hàm này gọi tới /auth/** (AuthController), KHÔNG phải /users
// nên KHÔNG dùng PATH ở trên, phải ghi thẳng đường dẫn "auth/..."
// ============================================

// Bước 1: Gửi email, backend sinh OTP và gửi mail
export const forgotPassword = (email) => post('auth/forgot-password', { email })


// Bước 2: Xác minh OTP, backend trả về resetToken (dùng cho bước 3)
export const verifyOpt = (email, otp) => post('auth/verify-otp', { email, otp });
// Bước 3: Đặt mật khẩu mới bằng resetToken đã xác minh ở bước 2
export const resetPasswordWithToken = (resetToken, newPassword) => post('auth/reset-password', { resetToken, newPassword })

//----------------------------------------------
export const register = (data) => post('auth/register', data)