import { toCourseCode } from "./string.utils"

export const generateClassCode = ({ courseName, branch, index }) => {
    const courseCode = toCourseCode(courseName);

    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const stt = String(index).padStart(2, '0');

    return `${branch}-${courseCode}-${yy}${mm}-${stt}`;
}

// chỉ xử lý logic filter, không gọi API
export const getClassIndexInMonth = (classes) => {
    const now = new Date();
    const yy = now.getFullYear();
    const mm = now.getMonth() + 1;
    const classesThisMonth = classes.filter(c => {
        if (!c.createdAt) return false;
        const d = new Date(c.createdAt);
        return d.getFullYear() === yy && (d.getMonth() + 1) === mm;
    });

    return classesThisMonth.length + 1;
}