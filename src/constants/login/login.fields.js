export const LOGIN_FIELDS = [
    {
        name: 'email',
        label: 'Email',
        form: { required: true, type: 'email' }
    },
    {
        name: 'password',
        label: 'Password',
        form: { required: true, type: 'password' }
    }
];

export const FORGOT_FIELDS = [
    {
        name: 'email',
        label: 'Email',
        form: { required: true, type: 'email' }
    },
]

export const RESET_FIELDS = [
    {
        name: 'password',
        label: 'Password',
        form: { required: true, type: 'password' }
    },
    {
        name: 'confirm',
        label: 'Confirm',
        form: { required: true, validate: 'confirm' }
    }
]