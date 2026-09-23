import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import './Register.scss'
import '../../assets/styles/common.scss'
import { useNavigate } from 'react-router-dom'
import { REGISTER_FIELD } from '../../constants/register/register.fields'
// import { create, findByEmail } from '../../services/userService'
import useForm from './../../hooks/useForm';
import FormItem from '../../components/FormControls/FormItem'
import { alertError, alertSuccess } from '@/utils/alert'
import { register } from '@/services/userService'
import { useDispatch } from 'react-redux'
import { buildUserPayload, saveAuthSession } from '@/utils/authSession'
import { loginAction } from '@/actions/authActions'

export default function Register() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {
    form,
    errors,   // lỗi validate PHÍA CLIENT (bắt buộc nhập, sai định dạng...)
    onChange,
    handleBlur,
    validate,
    getSubmitData
  } = useForm({ fields: REGISTER_FIELD })

  const [loading, setLoading] = useState(false)
  const [serverErrors, setServerErrors] = useState({});  // 👈 THÊM MỚI: lỗi trả về từ Java (trùng email/username)

  const handleSubmit = async (e) => {
    if (loading) return;
    e.preventDefault();
    // Bước 1: Validate CLIENT trước — nhanh, không tốn request lên server
    // Validate toàn bộ form
    const error = validate()
    if (error) return alertError({ text: 'Vui lòng điền đầy đủ thông tin!' });

    const form = getSubmitData();
    console.log("Data nhập từ Form", form);

    // ❗ xử lý riêng cho register
    if (form.password !== form.confirm) {
      return alertError({
        title: 'Mật khẩu xác nhận không khớp',
        text: 'Vui lòng xem lại mật khẩu vừa nhập!',
      })
    }
    setLoading(true)
    setServerErrors({});  // xoá lỗi server cũ trước khi gửi lần mới
    // 2. Logic gọi API (giữ từ useRegister sang) Logic này dùng database là json-server
    // const existing = await findByEmail(form.email)
    // if (existing.length > 0) return alertError({title: 'Email đã tồn tại!'});

    // const { confirm, ...userData } = form
    // console.log(confirm);
    // try {
    //   await create({
    //     ...userData,
    //     status: 'Active',
    //     role: 'USER',
    //     createdAt: new Date().toISOString()
    //   })
    //   alertSuccess({title: 'Đăng ký thành công!'}).then(() => navigate('/sign-in'))
    // }
    // catch {
    //   alertError({title: 'Đăng ký thất bại!'});      
    // }
    // finally {
    //   setLoading(false)
    // }
    try {
      const { confirm, ...userData } = form;
      const res = await register(userData);

      saveAuthSession(res);
      dispatch(loginAction(buildUserPayload(res)));
      // alertSuccess({ title: 'Đăng ký thành công!' }).then(() => navigate('/sign-in'));
      alertSuccess({ title: 'Đăng ký thành công!' }).then(() => navigate('/app'));

    } catch (err) {
      console.log("REGISTER ERROR:", err);
      if (err.fieldErrors) {
        // Nếu backend trả về lỗi cụ thể từng field (email đã tồn tại, username đã tồn tại...)
        setServerErrors(err.fieldErrors);
        alertError({ title: 'Đăng ký thất bại!', text: 'Vui lòng kiểm tra lại thông tin!' });
      } else {
        // Lỗi chung khác (mất kết nối, lỗi 500...)
        alertError({ title: 'Đăng ký thất bại!', text: err.message });
      }
    } finally {
      setLoading(false);
    }
  }
  // Hiển Thị Erorrs ra console Log 
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("=====HỆ THỐNG LỖI MỚI CẬP NHẬT======");
      console.table(errors);
      console.log("=========Data được USER nhập vào Form");
      console.table(form)
    }
  }, [errors, form])

  return (
    <div className="register-page">
      <form className="form" onSubmit={handleSubmit}>
        <p className="title">Register</p>
        <p className="message">Signup now and get full access to our app.</p>
        {REGISTER_FIELD.map(f => (
          <FormItem
            key={f.name}
            name={f.name}
            variant='auth'
            layout='horizontal'
            error={errors[f.name] || serverErrors[f.name]}  // 👈 THÊM MỚI: hiển thị lỗi từ server nếu có
          >
            <input
              disabled={loading}
              name={f.name}
              placeholder=" "
              value={form[f.name] ?? ''}
              onChange={(e) => {
                onChange(e)
                // Khi user gõ lại field đang lỗi server, xoá lỗi đó đi
                // (tránh lỗi "Email đã tồn tại" cứ dính mãi dù user đã sửa email khác)
                if (serverErrors[f.name]) {
                  setServerErrors(prev => {
                    const next = { ...prev }
                    delete next[f.name]
                    return next
                  });
                }
              }}
              onBlur={handleBlur}
            />
            <span>{f.name}</span>
          </FormItem>
        ))}
        <button className="submit" disabled={loading}>
          {loading ? 'Đang Xử lý...' : 'Submit'}
        </button>
        <p className="signin">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/sign-in')}>
            SignIn
          </button>
        </p>
      </form>
    </div>
  )
}