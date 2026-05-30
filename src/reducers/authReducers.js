// Reducer là 1 function nhận vào:
// state   → state hiện tại
// action  → { type, payload } do dispatch gửi đến
// Trả về  → state MỚI (không được sửa state cũ trực tiếp)
import { LOGIN, LOGOUT } from "../actions/authActions";
const initState = {
    currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
    isLoggedIn: !!localStorage.getItem('currentUser')}

export default function authReducer(state = initState, action) {
    switch (action.type) {
        case LOGIN:
            // Lưu vào localStorage để giữ sau khi F5
            localStorage.setItem('currentUser', JSON.stringify(action.payload))
            return {
                ...state,
                currentUser: action.payload,
                isLoggedIn: true
            }
        case LOGOUT:
            localStorage.removeItem('currentUser')
            return {
                ...state,
                currentUser: null,
                isLoggedIn: false
            }
        default:
            return state // bắt buộc có default — trả về state cũ nếu không match
    }
}