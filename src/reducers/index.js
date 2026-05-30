// combineReducers gộp nhiều reducer thành 1
// Mỗi reducer quản lý 1 "nhánh" riêng trong store
//
// store = {
//   auth: { currentUser, isLoggedIn }  ← do authReducer quản lý
//   // sau này có thể thêm: cart, theme...
// }

import { combineReducers } from 'redux'
import authReducer from './authReducers'
import masterDataReducer from './masterDataReducer'
const allReducers = combineReducers({
    auth: authReducer,              // state.auth.currentUser, state.auth.isLoggedIn
    masterData: masterDataReducer   // state.masterData.courses, .lectures, .students, .loaded
})

export default allReducers;

// Sau khi thêm, store sẽ có shape:
// {
//   auth: {
//     currentUser: { id, fullName, role, ... } | null,
//     isLoggedIn: true | false
//   },
//   masterData: {
//     courses:  [ { id, courseName, ... }, ... ],
//     lectures: [ { id, lectureName, ... }, ... ],
//     students: [ { id, studentName, ... }, ... ],
//     loaded: false  // ← false ban đầu, true sau khi fetch xong
//   }
// }