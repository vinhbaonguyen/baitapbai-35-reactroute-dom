import React, { useState } from 'react'
import './SignIn.scss'
import { forgotPassword, resetPasswordWithToken, verifyOpt } from '../../services/userService'
// import { findByEmail, updatePassword} from '../../services/userService'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginAction } from '../../actions/authActions'
import LoginForm from './LoginForm'
import ForgotForm from './ForgotForm'
import ResetForm from './ResetForm'
import { alertError, alertSuccess } from '@/utils/alert'
import { post } from '@/utils/requestAPI'
import { buildUserPayload, saveAuthSession } from '@/utils/authSession'

export default function SignIn() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // screen gồm 3 : login , forgot , reset 
  const [screen, setScreen] = useState('login')

  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('');
  // ----Handle Login------------------------------------------------------
  const handleLogin = async (data) => {
    console.log('DATA LOGIN', data);
    if (loading) return;
    setLoading(true)

    try {
      const { email, password } = data;
      const res = await post('auth/sign-in', { email, password });
      console.log("Kết Quả Sau Khi Login Thành Công", res);

      // ① lưu token vào localStorage
      saveAuthSession(res);        // 👈 thay cho 4 dòng localStorage.setItem

      // 👇 QUAN TRỌNG NHẤT: dispatch để Redux store biết "đã đăng nhập"
      // ② dispatch vào Redux — CÓ THỂ dùng làm "tín hiệu" để trigger lại fetch
      dispatch(loginAction(buildUserPayload(res)))

      alertSuccess({ title: `Xin chào, ${res.fullName}!` }).then(() => navigate('/app'))

    } catch (err) {
      console.log("Login Error", err);
      alertError({ title: 'Đăng nhập thất bại!,', text: `${err}` })
    } finally {
      setLoading(false)
    }

  }
  // ── Tìm tài khoản ─────────────────────────────────────────────────────
  // const handleFindAccount = async (data) => {
  //   console.log('Data from Forgot Password Screen ', data);
  //   if (loading) return;
  //   if (!data.email) return alertConfirm({ title: 'Vui lòng nhập email', })

  //   setLoading(true)
  //   try {
  //     const users = await findByEmail(data.email)
  //     if (users.length === 0) {
  //       setLoading(false)
  //       return alertError({ title: 'Email không tồn tại!', })
  //     }

  //     setFoundUser({
  //       id: users[0].id,
  //       fullName: users[0].fullName
  //     })
  //     setScreen('reset')
  //   } catch {
  //     alertError({ title: 'Lỗi kết nối server!' });
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // Bước 1: Gửi OTP
  const handleFindAccount = async (data) => {
    if (loading) return;
    setLoading(true)
    try {
      console.log("📤 Đang gửi email:", data.email);   // 👈 LOG 1: xác nhận dữ liệu gửi đi đúng chưa
      const res = await forgotPassword(data.email)
      console.log("📥 Kết quả từ backend:", res);        // 👈 LOG 2: xem backend trả về gì (nếu thành công)

      alertSuccess({ title: `${res}` })

      setEmail(data.email)
      setScreen('reset')
    } catch (err) {
      alertError({ title: 'Không thể gửi OTP', text: 'Vui lòng kiểm tra lại email' });
      console.log("Error ở công đoạn xác thực Email Tồn tại hay khg", err);
    } finally {
      setLoading(false)
    }
  }

  // Bước 2 + 3 gộp lại: verify OTP rồi đổi mật khẩu luôn trong 1 lần submit ResetForm
  const handleResetPassword = async (data) => {
    if (loading) return;
    const { otp, password: newPassword, confirm: confirmPassword } = data;

    if (newPassword !== confirmPassword) return alertError({ title: 'Mật khẩu xác nhận không khớp!' })

    setLoading(true)

    try {
      // Bước 2: verify OTP → lấy resetToken
      const { resetToken } = await verifyOpt(email, otp)

      // Bước 3: dùng resetToken đổi mật khẩu ngay
      await resetPasswordWithToken(resetToken, newPassword)

      alertSuccess({ title: "Đổi mật khẩu thành công!" }).then(() => setScreen('login'))


    } catch (err) {
      alertError({ title: 'Đổi mật khẩu thất bại!', text: 'OTP không đúng hoặc đã hết hạn' })
      console.log("Nội dung Error ở công đoạn gửi ResetToken và Đổi Password", err);
    } finally {
      setLoading(false)
    }
  }

  //Logic ứng với json-server
  // const { email: inputEmail, password: inputPassword } = data;

  // try {
  //   const users = await findByEmail(inputEmail)
  //   if (users.length === 0) {
  //     setLoading(false)
  //     return alertError({ title: 'Email không tồn tại!' })
  //   }
  //   const user = users[0]
  //   if (user.status !== 'Active') {
  //     setLoading(false)
  //     return alertError({ title: 'Tài khoản đã bị khóa!', text: 'Vui lòng liên hệ admin' })
  //   }

  //   if (user.password !== inputPassword) {
  //     setLoading(false)
  //     return alertError({ title: 'Mật khẩu không đúng!', })
  //   }

  //   const { password, ...safeUser } = user
  //   console.log(password);
  //   // TRƯỚC — lưu thẳng vào localStorage
  //   // localStorage.setItem('currentUser', JSON.stringify(safeUser))
  //   // SAU — dispatch action → reducer tự lưu localStorage + cập nhật store
  //   dispatch(loginAction(safeUser))
  //   alertSuccess({ title: `Xin chào, ${user.fullName}!` }).then(() => navigate('/app'))
  // } catch (err) {
  //   console.error("LOGIN ERROR:", err);
  //   alertError({title: 'Lỗi kết nối server!'})
  // } finally {
  //   setLoading(false)
  // }

  // ── Đặt lại mật khẩu ──────────────────────────────────────────────────
  // const handleResetPassword = async (data) => {
  //   if (loading) return;
  //   console.log('Data of Reset Screen', data);
  //   const { password: newPassword, confirm: confirmPassword } = data;

  //   if (newPassword !== confirmPassword)
  //     return alertError({ title: 'Mật khẩu xác nhận không khớp!' })

  //   if (newPassword.length < 6)
  //     return alertConfirm({ title: 'Mật khẩu phải ít nhất 6 ký tự!', });

  //   const confirm = await alertConfirm({ text: 'Bạn muốn đổi mật khẩu?', })

  //   if (!confirm.isConfirmed) return;

  //   if (!foundUser) return alertError({ title: 'Session hết hạn, vui lòng thao tác lại' });

  //   setLoading(true)
  //   try {
  //     await updatePassword(foundUser.id, newPassword)
  //     alertSuccess({ title: 'Đổi mật khẩu thành công!' })
  //       .then(() => { setScreen('login'); setFoundUser(null) })
  //   } catch {
  //     alertError({ title: 'Đổi mật khẩu thất bại!' })
  //   } finally {
  //     setLoading(false)
  //   }
  // }

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
        // titleHeader={foundUser?.fullName}
        />
      )}
    </div>
  )
}