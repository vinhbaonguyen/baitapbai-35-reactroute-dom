// ═══════════════════════════════════════════════════════
// ⚙️  CẤU HÌNH LƯỚI — chỉ cần đổi 1 dòng này
//     30 → mỗi ô = 30 phút
//     60 → mỗi ô = 1 tiếng
// ═══════════════════════════════════════════════════════
export const SLOT_DURATION_MINUTES = 60  // ← đổi 30 hoặc 60

export const SLOTS_PER_HOUR = 60 / SLOT_DURATION_MINUTES
// ── Tự sinh TIME_SLOTS theo SLOT_DURATION_MINUTES ─────────────────────────
// startHour=8, endHour=19 → hiển thị 08:00 → 19:00

const generateTimeSlots = (startHour = 8, endHour = 19) => {
    const slots = []
    for (let h = startHour; h <= endHour; h++) {
        for (let m = 0; m < 60; m += SLOT_DURATION_MINUTES) {
            // Không thêm ô quá endHour (VD: 19:30 khi endHour=19)
            if (h === endHour && m > 0) break
            slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
        }
    }
    return slots
}

export const TIME_SLOTS = generateTimeSlots() // tự sinh
console.log(TIME_SLOTS);

export const ROOMS = [
    { value: 'Phòng A001', label: 'Phòng A001', icon: '🏫' },
    { value: 'Phòng A101', label: 'Phòng A101', icon: '🏫' },
    { value: 'Phòng B001', label: 'Phòng B001', icon: '🏫' },
    { value: 'Phòng B202', label: 'Phòng B202', icon: '🏫' },
    { value: 'Phòng C001', label: 'Phòng C001', icon: '🏫' },
    { value: 'Phòng D001', label: 'Phòng D001', icon: '🏫' },
    { value: 'Online', label: 'Online', icon: '💻' },
]

export const DAYS = [
    { key: 'Mon', label: 'Thứ 2' },
    { key: 'Tue', label: 'Thứ 3' },
    { key: 'Wed', label: 'Thứ 4' },
    { key: 'Thu', label: 'Thứ 5' },
    { key: 'Fri', label: 'Thứ 6' },
    { key: 'Sat', label: 'Thứ 7' },
    { key: 'Sun', label: 'CN' },
]

export const DURATION_OPTIONS = [
    { value: 1, label: '1 tiếng' },
    { value: 2, label: '2 tiếng' },
    { value: 3, label: '3 tiếng' },
]

// Màu cho từng lớp trên lưới (theo classId % length)
export const CLASS_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
    '#14b8a6', '#84cc16', '#06b6d4', '#a855f7',
]
// Fields dùng cho compareData khi Edit

export const SCHEDULE_FIELDS = [
    { name: 'classId', form: { type: 'number', compare: true } },
    { name: 'days', form: { type: 'array', compare: true } },
    { name: 'startTime', form: { type: 'text', compare: true } },
    { name: 'endTime', form: { type: 'text', compare: true } },
    { name: 'room', form: { type: 'text', compare: true } },
    { name: 'duration', form: { type: 'number', compare: true } },
    { name: 'startDate', form: { type: 'date', compare: true } }, // ✅ Ngày khai giảng
    { name: 'endDate', form: { type: 'date', compare: true } }, // ✅ Ngày bế giảng
]
