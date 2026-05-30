export const REGISTER_FIELD = [
    {
        name: 'fullName',
        label: 'Họ và Tên',       
        form: { required: true, type: 'text' },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'userName',
        label: 'Tên Đăng Nhập',        
        form: { required: true, type: 'text' },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'email',
        label: 'Email',        
        form: { required: true, type: 'text' },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'password',
        label: 'Mật Khẩu',        
        form: {
            type: 'password',
            required: true,
            validate: 'password',
        },
        table: { type: 'text' },
        history: { type: 'text' }
    },
    {
        name: 'confirm',
        label: 'Xác Nhận Mật Khẩu',        
        form: {
            type: 'password',
            required: true,
            validate: 'confirm',
        },
        table: { type: 'text' },
        history: { type: 'text' }
    }
];