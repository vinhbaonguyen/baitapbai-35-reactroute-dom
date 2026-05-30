import React, { useState } from 'react'
import './SignIn.scss'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { findByEmail, updatePassword } from '../../services/userService'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginAction } from '../../actions/authActions'
import LoginForm from './LoginForm'
import ForgotForm from './ForgotForm'
import ResetForm from './ResetForm'
import { alertConfirm, alertError, alertSuccess } from '@/utils/alert'

export default function SignIn() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [screen, setScreen] = useState('login')  // screen gồm 3 : login , forgot , reset 
  const [foundUser, setFoundUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (data) => {
    console.log('DATA LOGIN', data);
    if (loading) return;
    setLoading(true)
    const { email: inputEmail, password: inputPassword } = data

    try {
      const users = await findByEmail(inputEmail)
      if (users.length === 0) {
        setLoading(false)
        return alertError({ title: 'Email không tồn tại!' })
      }
      const user = users[0]
      if (user.status !== 'Active') {
        setLoading(false)
        return alertError({ title: 'Tài khoản đã bị khóa!', text: 'Vui lòng liên hệ admin' })
      }

      if (user.password !== inputPassword) {
        setLoading(false)
        return alertError({ title: 'Mật khẩu không đúng!', })
      }

      const { password, ...safeUser } = user
      console.log(password);
      // TRƯỚC — lưu thẳng vào localStorage
      // localStorage.setItem('currentUser', JSON.stringify(safeUser))
      // SAU — dispatch action → reducer tự lưu localStorage + cập nhật store
      dispatch(loginAction(safeUser))
      alertSuccess({ title: `Xin chào, ${user.fullName}!` }).then(() => navigate('/app'))
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alertError({title: 'Lỗi kết nối server!'})
    } finally {
      setLoading(false)
    }
  }
  // ── Tìm tài khoản ─────────────────────────────────────────────────────
  const handleFindAccount = async (data) => {
    console.log('Data from Forgot Password Screen ', data);
    if (loading) return;
    if (!data.email) return alertConfirm({ title: 'Vui lòng nhập email', })

    setLoading(true)
    try {
      const users = await findByEmail(data.email)
      if (users.length === 0) {
        setLoading(false)
        return alertError({ title: 'Email không tồn tại!', })
      }

      setFoundUser({
        id: users[0].id,
        fullName: users[0].fullName
      })
      setScreen('reset')
    } catch {
      alertError({title: 'Lỗi kết nối server!'});      
    } finally {
      setLoading(false)
    }
  }

  // ── Đặt lại mật khẩu ──────────────────────────────────────────────────
  const handleResetPassword = async (data) => {
    if (loading) return;
    console.log('Data of Reset Screen', data);
    const { password: newPassword, confirm: confirmPassword } = data;

    if (newPassword !== confirmPassword)
      return alertError({ title: 'Mật khẩu xác nhận không khớp!' })

    if (newPassword.length < 6)
      return alertConfirm({ title: 'Mật khẩu phải ít nhất 6 ký tự!', });

    const confirm = await alertConfirm({text: 'Bạn muốn đổi mật khẩu?',})   

    if (!confirm.isConfirmed) return;

    if (!foundUser) return alertError({title: 'Session hết hạn, vui lòng thao tác lại'});   
    
    setLoading(true)
    try {
      await updatePassword(foundUser.id, newPassword)
      alertSuccess({title: 'Đổi mật khẩu thành công!'})
      .then(() => { setScreen('login'); setFoundUser(null) })
    } catch {
      alertError({title: 'Đổi mật khẩu thất bại!'})      
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signin-page">
      {/* ── LOGIN ── */}
      {
        screen === 'login' && (
          <LoginForm
            onSubmit={handleLogin}
            loading={loading}
            onGotoForgot={() => {
              setScreen('forgot')
            }}
            onGotoRegister={() => navigate('/register')}
          />
        )
      }
      {/* ── FORGOT ── */}
      {screen === 'forgot' && (
        <ForgotForm
          loading={loading}
          onSubmit={handleFindAccount}
          onGoToLogin={() => { setScreen('login'); }}
        />
      )}
      {/* ── RESET ── */}
      {screen === 'reset' && (
        <ResetForm
          loading={loading}
          onSubmit={handleResetPassword}
          onGoToLogin={() => { setScreen('login'); }}
          titleHeader={foundUser?.fullName}
        />
      )}
    </div>
  )
}