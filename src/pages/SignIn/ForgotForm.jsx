import { FORGOT_FIELDS } from '../../constants/login/login.fields';
import useForm from '../../hooks/useForm';
import React from 'react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import SignFormWrapper from './SignFormWrapper';
import AuthHeader from './AuthHeader';

export default function ForgotForm({ loading, onSubmit, onGoToLogin }) {
    const {
        form,        
        onChange,       
        validate,
        getSubmitData
    } = useForm({ fields: FORGOT_FIELDS })

    const handleSubmit = (e) => {
        e.preventDefault();
        const error = validate();       
        if (error) {
            return Swal.fire({
                icon: 'warning',
                title: error,
                timer: 2000,
                showConfirmButton: false
            })
        }
        onSubmit(getSubmitData())
    }
    return (
        <SignFormWrapper
            className='signin-form--forgot'
            onSubmit={handleSubmit}
        >
            <AuthHeader
                title='FORGOT'
                subtitle='Enter your email'
            />
            <div className="signin-form__field">
                <input
                    disabled={loading}
                    placeholder="YOUR EMAIL"
                    type='email'
                    name='email'
                    autoComplete="email"
                    value={form.email}
                    onChange={onChange}                   
                    autoFocus
                />               
            </div>

            <div className="signin-form__footer">
                <button type="submit" className="signin-form__submit" disabled={loading}>
                    {loading ? 'Đang tìm...' : 'Find Account'}
                </button>
                <div className="signin-form__bottom">
                    <button
                        type="button"
                        className="signin-form__link"
                        onClick={onGoToLogin}>
                        <span>← Back to Login</span>
                    </button>
                </div>
            </div>
        </SignFormWrapper>
    )
}
