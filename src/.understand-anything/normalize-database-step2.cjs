const fs = require('fs');
const path = require('path');

const sourcePath = 'B:/ReactJs(bai-27)Tech28/baitap-bai-35/baitap-bai35-react-route-dom/database/database.json';
const outputPath = path.join(__dirname, 'database.step2.cleaned.json');
const reportPath = path.join(__dirname, 'database.step2.report.json');

const db = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const report = [];

const toCourseIds = (value) => {
  if (Array.isArray(value)) return value.map(Number).filter(Number.isFinite);
  if (value === null || value === undefined || value === '') return [];
  const id = Number(value);
  return Number.isFinite(id) ? [id] : [];
};

const addReport = (type, detail) => report.push({ type, ...detail });

let nextStudentCourseId = Math.max(0, ...(db.student_course || []).map((row) => Number(row.id) || 0)) + 1;
const normalizedStudentCourse = [];
const seenPairs = new Set();

for (const row of db.student_course || []) {
  const studentId = Number(row.studentId);
  const courseIds = toCourseIds(row.courseId);

  if (!Number.isFinite(studentId) || courseIds.length === 0) {
    addReport('drop-invalid-student-course', { row });
    continue;
  }

  courseIds.forEach((courseId, index) => {
    const pairKey = `${studentId}:${courseId}`;

    if (seenPairs.has(pairKey)) {
      addReport('drop-duplicate-student-course', {
        originalId: row.id,
        studentId,
        courseId
      });
      return;
    }

    seenPairs.add(pairKey);

    const normalizedRow = {
      ...row,
      id: index === 0 ? row.id : nextStudentCourseId++,
      studentId,
      courseId
    };

    if (Array.isArray(row.courseId)) {
      addReport('split-course-array', {
        originalId: row.id,
        newId: normalizedRow.id,
        studentId,
        from: row.courseId,
        to: courseId
      });
    }

    normalizedStudentCourse.push(normalizedRow);
  });
}

normalizedStudentCourse.sort((a, b) => Number(a.id) - Number(b.id));
db.student_course = normalizedStudentCourse;

const courseIdsByStudent = new Map();
for (const row of db.student_course) {
  if (!courseIdsByStudent.has(row.studentId)) courseIdsByStudent.set(row.studentId, []);
  courseIdsByStudent.get(row.studentId).push(row.courseId);
}

for (const student of db.students || []) {
  const oldCourseIds = toCourseIds(student.courseId);
  const newCourseIds = [...new Set(courseIdsByStudent.get(Number(student.id)) || oldCourseIds)];

  if (JSON.stringify(oldCourseIds) !== JSON.stringify(newCourseIds) || !Array.isArray(student.courseId)) {
    addReport('sync-student-courseId-array', {
      studentId: student.id,
      from: student.courseId,
      to: newCourseIds
    });
  }

  student.courseId = newCourseIds;
}

fs.writeFileSync(outputPath, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`student_course rows: ${(db.student_course || []).length}`);
console.log(`Changes: ${report.length}`);
