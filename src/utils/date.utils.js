export const formatDateDisplay = (date,locale='vi-VN') => {
    if (!date) return '-'

    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleDateString(locale)
}

// const formatDate = (date) => date ? new Date(date).toLocaleDateString('jp-JP') : '-';

// Format ngày giờ đẹp
export const formatDateHistory = (date) =>
  new Date(date).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

