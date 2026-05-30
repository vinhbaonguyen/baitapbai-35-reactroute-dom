import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.scss'
import { useSelector } from 'react-redux'
import { selectClasses, selectClassSchedules, selectCourses, selectLectures, selectStudents } from '@/store/selectors/masterDataSelectors'
import { STUDENT_STATUS_OPTIONS } from '@/constants/students/student.constants'
import { getInitials } from '@/utils/string.utils'
import { COURSE_STATUS_OPTIONS } from '@/constants/courses/course.constants'

// ─── MOCK DATA (giả lập API) ───────────────────────────────────────────────
const SCORE_DATA = [
  { label: 'Excellent', value: 32, color: '#f97316' },
  { label: 'Good', value: 41, color: '#a78bfa' },
  { label: 'Average', value: 20, color: '#fb923c' },
  { label: 'Poor', value: 7, color: '#e5e7eb' },
]
// Bar chart data (17 cột)
const MONTHLY_DATA = [40, 70, 55, 90, 60, 80, 45, 95, 70, 60, 85, 75, 50, 65, 80, 55, 90]

const DAY_MAP = {
  Mon: 'T2', Tue: 'T3', Wed: 'T4',
  Thu: 'T5', Fri: 'T6', Sat: 'T7', Sun: 'CN'
}

// Tạo chuỗi conic-gradient động từ SCORE_DATA
const buildConicGradient = (data) => {
  let acc = 0
  const stops = data.map(d => {
    const from = acc
    acc += d.value
    return `${d.color} ${from}% ${acc}%`
  })
  return `conic-gradient(${stops.join(', ')})`
}

// ✅ Tính thẳng — không cần state vì chỉ đọc 1 lần lúc render
const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'GOOD MORNING'
  if (h < 18) return 'GOOD AFTERNOON'
  return 'GOOD EVENING'
}

// ─── COMPONENT ────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  // Phần Logic liên quan Redux ----------------------------------------------  
  const currentUser = useSelector(state => state.auth.currentUser)

  const students = useSelector(selectStudents);
  const courses = useSelector(selectCourses);
  const lectures = useSelector(selectLectures);
  const classes = useSelector(selectClasses);
  const classSchedules = useSelector(selectClassSchedules)
  // Tải data xem ở console log-----------------------------------------------
  useEffect(() => {
    console.log("current User", currentUser);
    console.log("Data Students", students);
    console.log("Data Courses", courses);
    console.log("Data Lectures", lectures);
    console.log("Data Classes", classes);
    console.log("Data classSchedule", classSchedules);


  }, [students, currentUser, courses, lectures, classes, classSchedules])
  // ── State ──────────────────────────────────────────────────────────────
  const [clock, setClock] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [searchStd, setSearchStd] = useState('');
  const [searchCourse, setSearchCourse] = useState('');
  const [activeTabStudent, setActiveTabStudent] = useState('all');
  const [activeTabCourse, setActiveTabCourse] = useState('all');

  // 2. Đồng hồ realtime — cleanup khi unmount
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(id)   // cleanup function
  }, []);

  // 3. Giả lập fetch dữ liệu (setTimeout thay cho API call)
  useEffect(() => {
    const id = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(id)
  }, [])
  // ── Stats từ real data ───────────────────────────────────────────
  const stats = useMemo(() => [
    {
      id: 1,
      label: 'Tổng Học Viên',
      value: students.length,
      icon: '🎓',
      change: `${students.filter(s => s.status !== 'Completed').length} học viên đang học`,
      color: 'orange',
      path: '/app/student'
    },
    {
      id: 2,
      label: 'Tổng Khóa Học',
      value: courses.length,
      icon: '📚',
      change: `${courses.filter(course => course.status !== 'Inactive').length} khóa đang mở`,
      color: 'pink',
      path: '/app/course'
    },
    {
      id: 3,
      label: 'Tổng lớp học ',
      value: classes?.length,
      icon: '🏫',
      change: `${classes?.filter(cls => cls.status !== 'Completed').length} lớp đang mở`,
      color: 'purple',
      path: '/app/class'
    },
    {
      id: 4,
      label: 'Giảng Viên',
      value: lectures.length,
      icon: '👨‍🏫',
      change: `${lectures.map(l => l.status !== 'Finished').length} đang công tác`,
      color: 'blue',
      path: '/app/lecture'
    }

  ], [students, courses, classes, lectures])

  // ── Derived state (tính toán từ state) ─────────────────────────── 
  // filter theo search + tab
  // 1. Students
  const recentStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [students]);

  const visibleStudents = useMemo(() => {
    return recentStudents
      .filter(s => s.studentName.toLowerCase().includes(searchStd.toLowerCase()))
      .filter(s => activeTabStudent === 'all' || s.status.toLowerCase() === activeTabStudent)
  }, [recentStudents, searchStd, activeTabStudent]);
  //2. Course
  const recentCourses = useMemo(() => {
    return [...courses]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [courses])
  const visibleCoures = useMemo(() => {
    return recentCourses
      .filter(c => c.courseName.toLowerCase().includes(searchCourse.toLowerCase()))
      .filter(c => activeTabCourse === 'all' || c.status.toLowerCase() === activeTabCourse)
  }, [searchCourse, recentCourses, activeTabCourse])

  const STUDENT_STATUS = STUDENT_STATUS_OPTIONS.map(s => s.value.toLowerCase());
  const COURSE_STATUS = COURSE_STATUS_OPTIONS.map(c => c.value.toLowerCase());

  // ── Class schedule (join với classSchedules) ───────────────────────────
  const scheduleRows = useMemo(() => {
    return classes
      ?.filter(c => c.status === 'Active')
      .map(cls => {
        const sch = classSchedules?.find(s => Number(s.classId) === Number(cls.id))
        const course = courses.find(c => Number(c.id) === Number(cls.courseId))
        const lecture = lectures.find(l => Number(l.id) === Number(cls.lectureId))
        return {
          ...cls,
          courseName: course?.courseName || '-',
          lectureName: lecture?.lectureName || '-',
          days: sch?.days || [],
          startTime: sch?.startTime || null,
          endTime: sch?.endTime || null,
          room: sch?.room || null
        }
      })
  }, [classes, classSchedules, courses, lectures])

  // ── Render ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="home__loading">
        <div className="home__spinner" />
        <p>Loading dashboard…</p>
      </div>
    )
  }

  return (
    <div className="home">
      {/* ── Greeting bar ── */}
      <div className="home__topbar">
        <div>
          <h1 className="home__greeting">{getGreeting()} {currentUser.userName} 🎓</h1>
          <p className="home__sub">Here's today's overview for your students &amp; courses</p>
        </div>
        <div className="home__clock">
          <span>{clock.toLocaleDateString('vi-VN')}</span>
          <strong>{clock.toLocaleTimeString('vi-VN')}</strong>
        </div>
      </div>

      {/* ── Stats cards 4-column grid ── */}
      <div className="home__stats">
        {stats.map(stat => (
          <div key={stat.id} className={`stat stat--${stat.color}`}>
            <div className="stat__icon">{stat.icon}</div>
            <div className="stat__body" onClick={()=>navigate(`${stat.path}`)}>
              <p className="stat__label">{stat.label}</p>
              <h2 className="stat__value">{stat.value}</h2>
              <span className="stat__change">↑ {stat.change} vs last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main 3-column grid ── */}
      <div className="home__grid">
        {/* ── COL 1: Students + Score ── */}
        <div className="home__col">
          {/* Recent Students */}
          <div className="card">
            <div className="card__head">
              <h3>Recent Students</h3>
              <button
                className="card__more"
                onClick={() => navigate('/app/student')}
              >
                View all →
              </button>
            </div>

            {/* Search box */}
            <input
              className="card__search"
              type="text"
              placeholder="🔍 Search student…"
              value={searchStd}
              onChange={e => setSearchStd(e.target.value)}
            />

            {/* Filter tabs */}
            <div className="tabs">
              {['all', ...STUDENT_STATUS].map(tab => (
                <button
                  key={tab}
                  className={`tabs__btn${activeTabStudent === tab ? ' tabs__btn--active' : ''}`}
                  onClick={() => setActiveTabStudent(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* List */}
            <ul className="student-list">
              {visibleStudents.length > 0
                ? visibleStudents.map(s => (
                  <li key={s.id} className="student-list__item">
                    <div className="student-list__avatar">{getInitials(s.studentName)}</div>
                    <div className="student-list__info">
                      <strong>{s.studentName}</strong>
                      <small>{s.email}</small>
                    </div>
                    <span className={`badge badge--${s.status?.toLowerCase()}`}>
                      {s.status}
                    </span>
                  </li>
                ))
                : <li className="student-list__empty">No students found 😕</li>
              }
            </ul>
          </div>

          {/* Score Distribution */}
          <div className="card">
            <h3>Score Distribution</h3>
            <div className="score">
              <div
                className="score__donut"
                style={{ background: buildConicGradient(SCORE_DATA) }}
              />
              <div className="score__legend">
                {SCORE_DATA.map((d, i) => (
                  <div key={i} className="score__item">
                    <span className="score__dot" style={{ background: d.color }} />
                    <span>{d.label} {d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── COL 2: Course table + Monthly chart ── */}
        <div className="home__col">
          {/* Course Data Summary */}
          <div className="card">
            <div className="card__head">
              <h3>Course Data Summary</h3>
              <button className="card__more" onClick={() => navigate('/app/course')}>
                View all →
              </button>
            </div>
            {/* Search box */}
            <input
              className="card__search"
              type="text"
              placeholder="🔍 Search course…"
              value={searchCourse}
              onChange={e => setSearchCourse(e.target.value)}
            />

            {/* Filter tabs */}
            <div className="tabs">
              {['all', ...COURSE_STATUS].map(tab => (
                <button
                  key={tab}
                  className={`tabs__btn${activeTabCourse === tab ? ' tabs__btn--active' : ''}`}
                  onClick={() => setActiveTabCourse(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Course ID</th>
                    <th>Status</th>
                    <th>Next Class</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleCoures.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.courseName}</strong></td>
                      <td>{c.category}</td>
                      <td>
                        <span className={`badge badge--${c.status?.toLowerCase()}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>{c.nextClass}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Enrollment (Bar chart thuần CSS) */}
          <div className="card">
            <h3>Monthly Enrollment</h3>
            <div className="bar-chart">
              <div className="bar-chart__y">
                {[300, 250, 200, 150, 100, 50, 0].map(v => (
                  <span key={v}>${v}</span>
                ))}
              </div>
              <div className="bar-chart__bars">
                {MONTHLY_DATA.map((v, i) => (
                  <div key={i} className="bar-chart__col">
                    <div
                      className="bar-chart__bar"
                      style={{ height: `${v}%` }}
                      title={`Month ${i + 1}: ${v}`}
                    />
                    <span className="bar-chart__lbl">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── COL 3: Class Schedule ── */}
        <div className="home__col">
          <div className="card card--schedule">           
            <div className='card__head'>
              <h3>Lịch Học Đang Hoạt Động</h3>
              <button className='card__more' onClick={() => navigate('/app/schedule')}>
                Xem tất cả →
              </button>
            </div>
            {scheduleRows.length === 0
              ? <p className='schedule-warning' >Chưa có lớp Active</p>
              : (
                <div className='schedule'>
                  {scheduleRows.map((cls, i) => (
                    <div key={cls.id} className='schedule__item'>
                      <div className='schedule__time'>
                        {cls.startTime ? `${cls.startTime}-${cls.endTime}` : 'Chưa có lịch'}
                      </div>
                      <div className='schedule__timeline'>
                        <div className='schedule__dot'>
                          {i < scheduleRows.length && <div className="schedule__line" ></div>}
                        </div>
                      </div>
                      <div className="schedule__info">
                        <div className="schedule__info-head">
                          <strong>{cls.courseName}</strong>
                          <span className={`badge badge--${cls.status?.toLowerCase()}`} style={{ fontSize: '.7rem' }}>
                            {cls.status}
                          </span>
                        </div>
                        <p className='schedule__info-lecturename'>
                          👨‍🏫 {cls.lectureName}
                        </p>
                        {cls.startTime
                          ? (
                            <div className="schedule__meta">
                              <span>🕐 {cls.startTime} - {cls.endTime}</span>
                              {cls.room && <span>📍 {cls.room}</span>}
                              {cls.days?.length > 0 && (
                                <div className="schedule__days">
                                  {cls.days.map(d => (
                                    <span key={d} className="schedule__day-tag">
                                      {DAY_MAP[d] || d}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                          : <p className='schedule__info-noschedule'>
                            ⚠️ Chưa có lịch học
                          </p>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
            {/* Footer payment bar */}
            <div className="schedule__footer">
              <div>
                <span className="schedule__footer-label">Total Payment</span>
                <strong className="schedule__footer-amount">$8,440</strong>
              </div>
              <button
                className="schedule__pay-btn"
                onClick={() => alert('Payment feature coming soon!')}
              >
                Pay
              </button>
            </div>
          </div>
        </div>

      </div>
    </div >
  )
}