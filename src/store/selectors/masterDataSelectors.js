// ================================================================
// Chỉ dùng useSelector để đọc raw data từ store
// Việc tính toán map để useLookupMaps (useMemo) trong component lo
// ================================================================

// ── Raw selectors: đọc thẳng array từ store ─────────────────────
// Trả về cùng reference nếu data không đổi → không gây re-render
export const selectCourses = state => state.masterData.courses;
export const selectLectures = state => state.masterData.lectures;
export const selectStudents = state => state.masterData.students;
export const selectClasses = state => state.masterData.classes;
export const selectClassSchedules = state => state.masterData.classSchedules
export const selectMasterLoaded = state => state.masterData.loaded;