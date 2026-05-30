export const PROFILE_PASSWORD_FIELDS = (isAdmin) => [
    !isAdmin && {
        name: 'current',
        label: 'Mật khẩu hiện tại',
        form: { type: 'password', required: true }
    },
    {
        name: 'next',
        label: 'Mật khẩu mới',
        form: { type: 'password', required: true }
    },
    {
        name: 'confirm',
        label: 'Xác nhận mật khẩu',
        form: { type: 'password', required: true }
    }
].filter(Boolean)