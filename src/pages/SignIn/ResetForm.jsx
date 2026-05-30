import React from 'react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import SignFormWrapper from './SignFormWrapper';
import AuthHeader from './AuthHeader';
import useForm from '../../hooks/useForm';
import { RESET_FIELDS } from '@/constants/login/login.fields';

export default function ResetForm({
    loading,
    onSubmit,
    onGoToLogin,
    titleHeader }) {

    const { form, onChange, validate, getSubmitData } = useForm({ fields: RESET_FIELDS })
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
            className='signin-form--reset'
            onSubmit={handleSubmit}
        >
            <AuthHeader
                title='RESET'
                subtitle={titleHeader ? `Hello ${titleHeader}` : ''}
            />

            <div className="signin-form__field">
                <input
                    disabled={loading}
                    placeholder="NEW PASSWORD"
                    type="password"
                    autoComplete="new-password"
                    name='password'
                    value={form.password}
                    onChange={onChange} />
            </div>

            <div className="signin-form__field signin-form__field--password">
                <input
                    disabled={loading}
                    placeholder="CONFIRM PASSWORD"
                    type="password"
                    name='confirm'
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={onChange} />
            </div>

            <div className="signin-form__footer">
                <button type="submit" className="signin-form__submit" disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Reset Password'}
                </button>
                <div className="signin-form__bottom">
                    <button
                        type="button" className="signin-form__link"
                        onClick={onGoToLogin}>
                        ← Back to Login
                    </button>
                </div>
            </div>
        </SignFormWrapper>
    )
}
