// Tạo mã khóa học: RA001, RA002...
export const generateCourseCode = (courses) => {
    if (!courses || courses?.length == 0) return 'RA001';
    const courseCodeList = courses.map(d => d.courseCode);
    let maxCourseCode = courseCodeList.reduce((max, courseCode) => {
      let num = parseInt(courseCode.replace('RA', ''))
      return max > num ? max : num
    }, 0)

    return `RA${String(maxCourseCode + 1).padStart(3, '0')}`
  };

  
// Tự sinh lectureCode dựa vào loại HĐ + danh sách GV hiện có
export const generateCode = (contractType, allLectures) => {
    // 1. Lọc ra danh sách các mã thuộc loại hợp đồng này (VD: ["CT-001", "CT-002"])
    const codes = allLectures
        .filter(l => l.lectureCode?.startsWith(contractType + '-'))
        .map(l => {
            // Tách phần số sau dấu gạch ngang (VD: "002" -> 2)
            const parts = l.lectureCode?.split('-');
            return parseInt(parts[1], 10) || 0;
        })
    // 2. Tìm số lớn nhất trong danh sách đó
    const maxNum = codes.length > 0 ? Math.max(...codes) : 0
    return `${contractType}-${String(maxNum + 1).padStart(3, '0')}`
}