import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

// config chung (1 nơi duy nhất)
const baseConfig = {
    customClass: { container: 'my-swal-container' }
}

// helper merge config
const fire = (options) => {
    return Swal.fire({
        ...baseConfig,
        ...options
    });
}

// ====== API ======
export const alertSuccess = ({title = 'Thành Công', ...options}) => {
    return fire({
        icon: 'success',
        title,
        timer: 2000,
        showConfirmButton: false,
        ...options
    });
};

export const alertError = ({title = 'Có Lỗi xảy ra !', ...options}) => {
    return fire({
        icon: 'error',
        title,
        ...options
    });
};
export const alertInfo = (title, text = '', options = {}) => {
    return fire({
        icon: 'info',
        title,
        text,
        ...options
    })
}

export const alertConfirm = ({
    title = 'Xác nhận',
    text,
    html,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    ...rest
}) => {
    return fire({
        icon: 'question',
        title,
        text,
        html,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        ...rest
    });
};