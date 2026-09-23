const fs = require('fs');
const path = require('path');

const sourcePath = 'B:/ReactJs(bai-27)Tech28/baitap-bai-35/baitap-bai35-react-route-dom/database/database.json';
const outputPath = path.join(__dirname, 'database.step1.cleaned.json');
const reportPath = path.join(__dirname, 'database.step1.report.json');

const db = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const report = [];

const numberFieldsByCollection = {
  courses: ['id', 'coursePeriod', 'sortOrder', 'tuitionFee'],
  classes: ['id', 'classNumber', 'courseId', 'lectureId', 'sortOrder'],
  lectures: ['id', 'experienceYears', 'hourRate', 'totalHours', 'monthSalary', 'sortOrder'],
  students: ['id', 'sortOrder'],
  auditLogs: ['id', 'entityId'],
  users: ['id', 'sortOrder'],
  student_course: ['id', 'studentId'],
  student_class: ['id', 'studentId', 'classId'],
  classSchedules: ['id', 'classId', 'duration'],
  scores: ['id', 'studentId', 'classId', 'courseId', 'finalScore', 'scoreAtFirstTime', 'scoreAtSecondTime', 'sortOrder']
};

const nullableStringFieldsByCollection = {
  classes: ['createdAt', 'updatedAt'],
  lectures: ['createdAt', 'updatedAt'],
  students: ['createdAt', 'updatedAt', 'dob'],
  users: ['createdAt', 'updatedAt', 'password'],
  classSchedules: ['startDate', 'endDate'],
  scores: ['createdAt', 'updatedAt', 'examDate', 'examDateFirstTime', 'examDateSecondTime', 'note']
};

const defaultFieldsByCollection = {
  courses: { sortOrder: null, tuitionFee: null },
  classes: { lectureName: null, sortOrder: null },
  lectures: { createdAt: null, assignedClasses: [], sortOrder: null, monthSalary: null },
  students: { hasPaidFee: false, sortOrder: null, dob: null },
  users: { password: null, updatedAt: null, sortOrder: null },
  classSchedules: { startDate: null, endDate: null },
  scores: {
    examDate: null,
    scoreAtFirstTime: null,
    examDateFirstTime: null,
    scoreAtSecondTime: null,
    examDateSecondTime: null,
    sortOrder: null
  }
};

function addReport(collection, id, field, from, to, reason) {
  report.push({ collection, id, field, from, to, reason });
}

function normalizeNumber(value) {
  if (value === '') return null;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return value;
}

for (const [collection, rows] of Object.entries(db)) {
  if (!Array.isArray(rows)) continue;

  const numberFields = numberFieldsByCollection[collection] || [];
  const nullableFields = nullableStringFieldsByCollection[collection] || [];
  const defaults = defaultFieldsByCollection[collection] || {};

  rows.forEach((row) => {
    if (Object.prototype.hasOwnProperty.call(row, '')) {
      addReport(collection, row.id ?? null, '', row[''], undefined, 'remove empty field name');
      delete row[''];
    }

    for (const [field, defaultValue] of Object.entries(defaults)) {
      if (!Object.prototype.hasOwnProperty.call(row, field)) {
        row[field] = Array.isArray(defaultValue) ? [...defaultValue] : defaultValue;
        addReport(collection, row.id ?? null, field, undefined, row[field], 'add missing schema field');
      }
    }

    for (const field of numberFields) {
      if (!Object.prototype.hasOwnProperty.call(row, field)) continue;
      const before = row[field];
      const after = normalizeNumber(before);
      if (before !== after) {
        row[field] = after;
        addReport(collection, row.id ?? null, field, before, after, 'normalize number field');
      }
    }

    for (const field of nullableFields) {
      if (!Object.prototype.hasOwnProperty.call(row, field)) continue;
      if (row[field] === '') {
        row[field] = null;
        addReport(collection, row.id ?? null, field, '', null, 'use null for empty value');
      }
    }

    if (collection === 'student_course') {
      if (typeof row.courseId === 'string' && row.courseId.trim() !== '' && !Number.isNaN(Number(row.courseId))) {
        const before = row.courseId;
        row.courseId = Number(row.courseId);
        addReport(collection, row.id ?? null, 'courseId', before, row.courseId, 'normalize scalar courseId');
      }
      if (Array.isArray(row.courseId)) {
        const before = [...row.courseId];
        row.courseId = row.courseId.map((id) => normalizeNumber(id));
        if (JSON.stringify(before) !== JSON.stringify(row.courseId)) {
          addReport(collection, row.id ?? null, 'courseId', before, row.courseId, 'normalize courseId array values');
        }
      }
    }

    if (collection === 'students' && Object.prototype.hasOwnProperty.call(row, 'courseId')) {
      if (typeof row.courseId === 'string' && row.courseId.trim() !== '' && !Number.isNaN(Number(row.courseId))) {
        const before = row.courseId;
        row.courseId = Number(row.courseId);
        addReport(collection, row.id ?? null, 'courseId', before, row.courseId, 'normalize scalar courseId');
      }
      if (Array.isArray(row.courseId)) {
        const before = [...row.courseId];
        row.courseId = row.courseId.map((id) => normalizeNumber(id));
        if (JSON.stringify(before) !== JSON.stringify(row.courseId)) {
          addReport(collection, row.id ?? null, 'courseId', before, row.courseId, 'normalize courseId array values');
        }
      }
    }
  });
}

fs.writeFileSync(outputPath, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
console.log(`Changes: ${report.length}`);
