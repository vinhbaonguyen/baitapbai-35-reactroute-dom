// ── Avatar placeholder (chữ cái đầu) ───────────────────────
export const getInitials = (fullName = '') => {
    return fullName
        .split(' ')
        .filter(Boolean)
        .slice(-2)    // lấy 2 từ cuối của fullname ví dụ fullName = Nguyễn Đình Vĩnh Bảo 2 từ cuối là Vĩnh Bảo
        .map(w => w[0].toUpperCase())
        .join('') ?? '?'
}
// Hàm lấy chử đầu tiên của courseName
export const toCourseCode = (courseName = '') => {
    if (!courseName) return '';
    const STOP_WORLDS = ['basic', 'cơ', 'bản', 'fullstack',
        'advanced', 'pro', 'master', 'course'];

    const words = courseName
        .split(' ')
        .filter(Boolean)
        .map(w => w.trim().toLowerCase())
        .filter(w => !STOP_WORLDS.includes(w))

    const initials = words
        .map(w => w[0].toUpperCase())
        .join('');
    return initials;
}