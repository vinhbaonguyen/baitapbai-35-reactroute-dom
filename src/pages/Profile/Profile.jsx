import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginAction } from '../../actions/authActions'
import * as userService from '../../services/userService'
import PageHeader from '../../components/PageComponent/PageHeader'
import './Profile.scss'
import { USER_FIELDS } from '../../constants/users/user.fields'
import useForm from '../../hooks/useForm'
import FormRenderer from '../../components/FormControls/FormRenderer'
import FormItem from '../../components/FormControls/FormItem'
import { getInitials } from '../../utils/string.utils'
import { formatDateDisplay } from '../../utils/date.utils'
import { compareData } from '@/utils/compareData'
import { alertConfirm, alertError, alertSuccess } from '@/utils/alert'
import { PROFILE_PASSWORD_FIELDS } from '@/constants/profile/profile.password.fields'
import { buildFormFields } from '@/utils/field.util'


export default function Profile() {
  const dispatch = useDispatch()
  const currentUser = useSelector(state => state.auth.currentUser)
  const isAdmin = ['ADMIN', 'MANAGER'].includes(currentUser.role)
  console.log(isAdmin);

  // ── Tab state ──────────────────────────────────────────────
  const [tab, setTab] = useState('info') // 'info' | 'password'  

  const {
    form: pwdForm,
    onChange: onPwdchange,
    validate: validatePwd,
    getSubmitData: getPwdData,
    resetForm: resetPwdForm
  } = useForm({ fields: PROFILE_PASSWORD_FIELDS(isAdmin) })

  const validatePassword = () => {
    const error = validatePwd()
    if (error) return error
    if (!pwdForm?.current && !pwdForm?.next && !pwdForm?.confirm) {
      return 'Vui lòng nhập đầy đủ!'
    }
    if (pwdForm.next !== pwdForm.confirm) {
      return 'Mật khẩu xác nhận không khớp'
    }
    if (pwdForm.next.length < 6) {
      return 'Mật khẩu tối thiểu 6 ký tự'
    }
    return null
  }
  const handleSavePwd = async () => {
    // 1. validate cơ bản
    const error = validatePassword()
    console.log(pwdForm);

    console.log(error);
    if (error) {
      console.log(error);
      alertError({ title: error })
      return
    }

    const confirm = await alertConfirm({ text: 'Bạn muốn đổi mật khẩu' })
    if (!confirm.isConfirmed) return
    const data = getPwdData()
    try {
      // 2. USER thường → phải check current password]
      if (!isAdmin) {
        const user = await userService.findByEmail(currentUser.email)
        const fullUser = user[0]
        console.log(fullUser);
        if (fullUser.password !== data.current) {
          return alertError({ title: 'Mật khẩu hiện tại không đúng!' })
        }
      }
      // 3. update password
      await userService.updatePassword(currentUser.id, data.next)
      // Sync lại Redux với password mới
      dispatch(loginAction({ ...currentUser }))

      resetPwdForm()
      alertSuccess({ title: 'Đổi mật khẩu thành công!' })
    } catch {
      alertError({ title: 'Đổi mật khẩu thất bại!' })
    }
  }

  const PROFILE_FIELDS = buildFormFields(
    USER_FIELDS,
    {
      remove: ['password'],
      adminOnly: ['role', 'status'],
      disabled: ['createdAt'],
      custom: {
        role: (field) => {
          field.form.compare = false
          return field
        },
        status: (field) => {
          field.form.compare = false
          return field
        }
      }
    },
    { isAdmin: true }
  )

  const {
    form,
    errors,
    onChange,
    handleBlur,
    validate,
    getSubmitData,
    resetForm
  } = useForm({ fields: PROFILE_FIELDS, editItem: currentUser })
  const handleSaveProfile = async () => {
    const error = validate()
    if (error) {
      alertError({ title: 'Vui lòng nhập đầy đủ thông tin!', content: error })
      return
    }
    let raw = getSubmitData();

    let data = {}
    if (isAdmin) {
      data = raw
    } else {
      data = {
        fullName: raw.fullName,
        userName: raw.userName,
        email: raw.email
      }
    }
    console.log("formData^form", form);
    console.log("formData^raw", raw);

    console.log("editItem", currentUser);
    console.log("fields", PROFILE_FIELDS);

    const { isChanged, changedFields } = compareData({
      formData: form,         // giá trị UI do User đã sửa 
      editItem: currentUser,  // giá trị ban đầu (giá trị sắp sửa Edit)
      fields: PROFILE_FIELDS
    })

    console.group("🧠 DEBUG COMPARE");
    console.table(changedFields);
    console.groupEnd();

    if (!isChanged) {
      await alertConfirm({
        title: 'Không có thay đổi',
        text: 'Bạn chưa thay đổi dữ liệu?',
        confirmText: 'Tiếp tục sửa',
        cancelText: 'Không (Đóng)'
      })
      return;
    }
    // ✅ Có thay đổi → confirm               
    const confirmEdit = await alertConfirm({
      title: 'Xác nhận cập nhật',
      html: `
        <div style="text-align:left">
            ${changedFields.map(f => `
                <p><b>${f.field}</b>:
                    <span style="color:red">${f.originalValue ?? '-'}</span> ⇒
                    <span style="color:green">${f.formValue ?? ''}</span>                            
                </p>
                `).join('')}                    
        </div>                    
        `,
      confirmText: 'Xác nhận Lưu',
      cancelText: 'Quay lại chỉnh sửa'
    })
    if (!confirmEdit.isConfirmed) return;
    try {
      const updatedData = await userService.update(currentUser.id, data)
      // Sync lại Redux + localStorage
      dispatch(loginAction({ ...updatedData }))
      alertSuccess({ title: 'Cập nhật thành công!' })
    } catch {
      alertError({ title: 'Cập nhật thất bại!' })
    }
  }

  return (
    <div className="profile">
      <PageHeader
        title="Thông Tin Cá Nhân"
        desc="Xem và chỉnh sửa thông tin tài khoản của bạn"
      />

      <div className="profile__card">
        {/* Avatar + basic info */}
        <div className="profile__avatar-wrap">
          <div className="profile__avatar">{getInitials(currentUser?.fullName)}</div>
          <div>
            <p className="profile__name">{currentUser?.fullName}</p>
            <span className={`badge badge--${currentUser?.role?.toLowerCase()}`}>
              {currentUser?.role}
            </span>
          </div>
        </div>

        {/* Readonly meta */}
        <div className="profile__meta">
          <span>Tên đăng nhập: <strong>{currentUser?.userName}</strong></span>
          <span>Ngày tham gia: <strong>
            {formatDateDisplay(currentUser?.createdAt)}
          </strong></span>
        </div>

        {/* Tabs */}
        <div className="profile__tabs">
          <button
            className={`profile__tab${tab === 'info' ? ' profile__tab--active' : ''}`}
            onClick={() => setTab('info')}
          >
            Thông tin cá nhân
          </button>
          <button
            className={`profile__tab${tab === 'password' ? ' profile__tab--active' : ''}`}
            onClick={() => setTab('password')}
          >
            Đổi mật khẩu
          </button>
        </div>

        {/* Tab: Info */}
        {tab === 'info' && (
          <div className="profile__form">
            <FormRenderer
              fields={PROFILE_FIELDS}
              form={form}
              onChange={onChange}
              handleBlur={handleBlur}
              errors={errors}
              editItem={currentUser}
              variant='profile'
              layout='horizontal'

            />
            <div className="profile__form-footer">
              <button className="btn btn--primary" onClick={handleSaveProfile}>Lưu thay đổi</button>
              <button className="btn btn--outline" onClick={resetForm}>Hủy thay đổi</button>
            </div>
          </div>
        )}

        {/* Tab: Password */}
        {tab === 'password' && (
          <div className="profile__form">
            <FormItem label="Mật khẩu hiện tại" layout='horizontal' required>
              <input
                name='current'
                type='password'
                value={pwdForm.current}
                onChange={onPwdchange}
                disabled={isAdmin}
              />
            </FormItem>
            <FormItem label='Mật khẩu mới' layout='horizontal' required>
              <input
                name='next'
                type='password'
                value={pwdForm.next}
                onChange={onPwdchange}
              />
            </FormItem>
            <FormItem label='Xác nhận' layout='horizontal' required>
              <input
                name='confirm'
                type='password'
                value={pwdForm.confirm}
                onChange={onPwdchange}
              />
            </FormItem>

            <div className="profile__form-footer">
              <button className="btn btn--primary" onClick={handleSavePwd}>Đổi mật khẩu</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}