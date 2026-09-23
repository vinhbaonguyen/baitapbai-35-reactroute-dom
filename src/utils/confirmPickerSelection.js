

/**
 * Xử lý xác nhận chung cho các Picker Modal (Skill, Status, Course...)
 * Chấp nhận picked là mảng (multi-select) HOẶC giá trị đơn (single-select)
 *
 * @param {Array|string|number|null} picked - lựa chọn hiện tại
 * @param {Function} onSave - callback khi xác nhận có chọn, nhận nguyên `picked`
 * @param {Function} onClose - đóng modal
 * @param {Function} [onEmptyConfirm] - callback khi user xác nhận "chọn rỗng"
 * @param {String} [emptyTitle] - tiêu đề cảnh báo khi chưa chọn gì
 */

import { alertConfirm } from "./alert"

export async function confirmPickerSelection({ picked, onSave, onClose, onEmptyConfirm, emptyTitle }) {
    const isEmpty = Array.isArray(picked)
        ? picked.length === 0
        : (picked === null || picked === undefined || picked === '')
    if (isEmpty) {
        const confirm = await alertConfirm({
            title: emptyTitle || "Bạn chưa chọn gì cả",
            confirmButtonText: 'Quay Lại Chọn',
            cancelButtonText: 'Thoát'
        })
        if (confirm.isConfirmed) return;
        if (confirm.isDismissed) onEmptyConfirm?.()
        onClose()
        return
    }
    onSave(picked);
    onClose()
}