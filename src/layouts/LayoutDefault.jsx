import React, { useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import './LayoutDefault.scss'
import { NavLink, Outlet } from 'react-router-dom'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'

export default function LayoutDefault() {
  const [menuChecked, setMenuChecked] = useState(false)
  const [subMenuStyle, setSubMenuStyle] = useState({})
  const [subMenuOpen, setSubMenuOpen] = useState(false)
  const blogLiRef = useRef(null)

  const navLinkActive = (e) =>
    e.isActive ? 'menu__link menu__link--active' : 'menu__link'

  const closeMenu = () => setMenuChecked(false)

  const handleBlogEnter = () => {
    if (blogLiRef.current) {
      const rect = blogLiRef.current.getBoundingClientRect()
      setSubMenuStyle({ position: 'fixed', top: rect.top, left: rect.right, width: 250, zIndex: 9999 })
      setSubMenuOpen(true)
    }
  }

  return (
    <>
      <Header />
      <main>
        <div id="container">
          {/* Checkbox điều khiển bằng React state — KHÔNG để browser tự quản lý */}
          <input
            id="toggle"
            type="checkbox"
            checked={menuChecked}
            onChange={e => setMenuChecked(e.target.checked)}
          />          
          <label htmlFor="toggle" />

          {/* Overlay chỉ render khi menu đang mở — bấm để đóng */}
          {menuChecked && <div className="menu-overlay" onClick={closeMenu} />}

          <div className="slide-menu">
            <h1>Menu</h1>
            <nav className="menu">
              <li><NavLink to='/app' end className={navLinkActive} onClick={closeMenu}>Home</NavLink></li>
              <li><NavLink to='/app/course' className={navLinkActive} onClick={closeMenu}>Course</NavLink></li>
              <li><NavLink to='/app/lecture' className={navLinkActive} onClick={closeMenu}>Lecture</NavLink></li>
              <li><NavLink to='/app/class' className={navLinkActive} onClick={closeMenu}>Class</NavLink></li>
              <li><NavLink to='/app/student' className={navLinkActive} onClick={closeMenu}>Students</NavLink></li>
              <li><NavLink to='/app/user' className={navLinkActive} onClick={closeMenu}>Users</NavLink></li>
              <li><NavLink to='/app/profile' className={navLinkActive} onClick={closeMenu}>Profile</NavLink></li>
              <li><NavLink to='/app/schedule' className={navLinkActive} onClick={closeMenu}>Class Schedule</NavLink></li>
              <li><NavLink to='/app/score' className={navLinkActive} onClick={closeMenu}>Score</NavLink></li>
              <li><NavLink to='/app/auditLog' className={navLinkActive} onClick={closeMenu}>Audit Log</NavLink></li>


              <li><NavLink to='/app/about' className={navLinkActive} onClick={closeMenu}>About</NavLink></li>
              <li><NavLink to='/app/contact' className={navLinkActive} onClick={closeMenu}>Contact</NavLink></li>
              <li ref={blogLiRef} onMouseEnter={handleBlogEnter} onMouseLeave={() => setSubMenuOpen(false)}>
                <NavLink to='/app/blog' className={navLinkActive}>Blog</NavLink>
              </li>
              <li><NavLink to='/register' className={navLinkActive} onClick={closeMenu}>Register</NavLink></li>
              <li><NavLink to='/sign-in' className={navLinkActive} onClick={closeMenu}>Sign In</NavLink></li>
            </nav>
          </div>

          <div className="content">
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />

      {subMenuOpen && ReactDOM.createPortal(
        <ul
          className="menu__sub menu__sub--open"
          style={subMenuStyle}
          onMouseEnter={() => setSubMenuOpen(true)}
          onMouseLeave={() => setSubMenuOpen(false)}
        >
          <li><NavLink to='/app/blog/news' className={navLinkActive} onClick={closeMenu}>BlogNew</NavLink></li>
          <li><NavLink to='/app/blog/related' className={navLinkActive} onClick={closeMenu}>BlogRelated</NavLink></li>
        </ul>,
        document.body
      )}
    </>
  )
}