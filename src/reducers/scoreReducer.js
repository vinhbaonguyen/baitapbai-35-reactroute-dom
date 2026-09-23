import {
    SET_SCORES,
    ADD_SCORE,
    UPDATE_SCORE,
    DELETE_SCORE
} from '../constants/score/score.constants';

const initialState = {
    scoresList: [],    // danh sách điểm
    loaded: false,
}

export default function scoreReducer(state = initialState, action) {
    switch (action.type) {
        // 1. Set toàn bộ danh sách điểm
        case SET_SCORES:
            return {
                ...state,
                scoresList: action.payload,
                loaded: true
            };
        // 2. Thêm 1 điểm mới
        case ADD_SCORE:
            return {
                ...state,
                scoresList: [...state.scoresList, action.payload]
            };
        // 3. Cập nhật 1 điểm
        case UPDATE_SCORE:
            return {
                ...state,
                scoresList: state.scoresList.map(score =>
                    score.id === action.payload.id
                        ? { ...score, ...action.payload.data }
                        : score
                )
            };
        // 4. Xóa 1 điểm
        case DELETE_SCORE:
            return {
                ...state,
                scoresList: state.scoresList.filter(score => score.id !== action.payload)
            };
        default:
            return state;
    }
}