import React from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/image/logo-rikkei2.png'
import './Header.scss'
import { useDispatch, useSelector } from 'react-redux'
import { loginAction, logoutAction } from '../../actions/authActions'

export default function Header() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // const user = JSON.parse(localStorage.getItem('currentUser'))
  // [SỬA] đọc currentUser từ Redux store thay vì localStorage
  // → khi store thay đổi (login/logout) Header tự re-render
  const currentUser = useSelector(state => state.auth.currentUser)

  const handleLogoutIn = () => {
    // localStorage.removeItem('currentUser')
    currentUser ? dispatch(logoutAction()) : dispatch(loginAction(currentUser))
    navigate('/sign-in')

  }

  return (
    <header className="header">
      <div className="header__wrapper">

        <div className="header__logo">
          <img className="header__logo-img" src={logo} alt="Rikkei Logo" />
          <p className="header__logo-desc">Để Nông Dân Biết Code</p>
        </div>

        <div className="header__title">
          <svg>
            <text x="50%" y="50%" dy=".35em" textAnchor="middle">
              Rikkei`s Student Management Site
            </text>
          </svg>
        </div>

        <div className="header__auth">
          <span
            className="header__auth-user"
            onClick={() => currentUser && navigate('/app/profile')}
            title="Xem hồ sơ"
            style={{ cursor: currentUser ? 'pointer' : 'default' }}
          >
            {currentUser?.fullName} <br />
            {currentUser?.role && (<span className='header__auth-role'> [{currentUser.role}] </span>)}
          </span>
          <button className="header__auth-btn" onClick={handleLogoutIn}>
            <i className="fa fa-sign-out" /> {currentUser ? 'Logout' : 'Log In'}
          </button>
        </div>

      </div>
    </header>
  )
}