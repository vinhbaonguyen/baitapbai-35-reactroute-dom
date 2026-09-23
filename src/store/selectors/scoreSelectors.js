// Lấy toàn bộ danh sách điểm
export const selectScoresList = state => state.score.scoresList;

// Kiểm tra đã load xong chưa
export const selectScoresLoaded = state => state.score.loaded;

//Lấy điểm theo classId
export const selectScoresByClassId = (state, classId) => {
    return state.score.scoresList.filter(score => score.classId === classId);
}

// Lấy điểm theo studentId
export const selectScoresByStudentId = (state, studentId) => {
    return state.score.scoresList.filter(score => score.studentId === studentId);
}

// Lây score theo scoreId
export const selectScoreById = (state, scoreId) => {
    return state.score.scoresList.find(score => score.id === scoreId);
}

//Lấy điểm theo courseId
export const selectScoresByCourseId = (state, courseId) => {
    return state.score.scoresList.filter(score => score.courseId === courseId);
}
