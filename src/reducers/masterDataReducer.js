import { SET_MASTER_DATA, UPDATE_MASTER_ENTITY } from "@/actions/masterDataAction"
const initialState = {
    courses: [],
    lectures: [],
    students: [],
    classes: [],
    classSchedules: [],
    studentClass: [], 
    studentCourse: [],
    specialties: [],
    loaded: false  // flag để biết đã fetch lần đầu chưa → tránh fetch lại khi F5
}
export default function masterDataReducer(state = initialState, action) {

    switch (action.type) {
        case SET_MASTER_DATA:
            // Merge vào state hiện tại — chỉ update entity được truyền vào
            // VD: setMasterData({ courses: [...] }) → chỉ courses thay đổi
            return {
                ...state,
                courses: action.payload.courses ?? state.courses,
                lectures: action.payload.lectures ?? state.lectures,
                students: action.payload.students ?? state.students,
                classes: action.payload.classes ?? state.classes,
                classSchedules: action.payload.classSchedules ?? state.classSchedules,
                studentClass: action.payload.studentClass ?? state.studentClass,
                studentCourse: action.payload.studentCourse ?? state.studentCourse,
                specialties: action.payload.specialties ?? state.specialties,
                loaded: true
            };
        case UPDATE_MASTER_ENTITY: {
            const { entity, action: crudAction, item } = action.payload;
            const list = state[entity] ?? [];
            let updatedList;
            switch (crudAction) {
                case 'create':
                    updatedList = [...list, item];
                    break;
                case 'update':
                    // Thay item cũ bằng item mới theo id
                    updatedList = list.map(i => i.id === item.id ? item : i);
                    break;
                case 'delete':
                    updatedList = list.filter(i => i.id !== item.id)
                    break;
                // 🔥 THÊM MỚI — thay thế TOÀN BỘ record khớp 1 điều kiện (VD classId)
                // bằng danh sách mới nhất trả về từ BE. Dùng cho StudentClass sau khi sync,
                // vì sync trả về cả mảng record cho 1 classId, không phải 1 item đơn theo id.
                case 'replaceByKey': {
                    const {key, value, items} = item;
                    const kept = list.filter(i => i[key] !== value);
                    updatedList = [...kept,...items];
                    break;
                }

                default:
                    updatedList = list;
            }

            return { ...state, [entity]: updatedList };
        }
        default:
            return state;
    }
}