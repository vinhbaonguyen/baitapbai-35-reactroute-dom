export const formatVND = (amount) => {
  if (!amount && amount !== 0) return '-'; // trống = miễn phí hoặc chưa nhập
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}